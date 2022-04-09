module.exports = ctx => {
  // const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Role {
    // add role right
    async addRoleRight({ roleAtomId, roleId, atomClassId, action, scope, user }) {
      // role
      const _role = await this._forceRoleAndCheckRightRead({ roleAtomId, roleId, user });
      roleId = _role.id;
      // scope
      if (scope) {
        if (typeof scope === 'string') {
          scope = scope.split(',');
        } else if (!Array.isArray(scope)) {
          scope = [scope];
        }
      }
      // force action exists in db
      await ctx.bean.atomAction.get({ atomClassId, code: action });

      // roleRight
      const res = await this.modelRoleRight.insert({
        roleId,
        atomClassId,
        action,
        scope: JSON.stringify(scope),
      });
      const roleRightId = res.insertId;
      // roleRightRef
      if (scope) {
        for (const roleIdScope of scope) {
          await this.modelRoleRightRef.insert({
            roleRightId,
            roleId,
            atomClassId,
            action,
            roleIdScope,
          });
        }
      }
      return roleRightId;
    }

    // delete role right
    async deleteRoleRight({ roleAtomId, roleId, roleRightId, user }) {
      roleId = await this._forceRoleId({ roleAtomId, roleId });
      // id + roleId for safety
      await this.modelRoleRight.delete({ id: roleRightId, roleId });
      await this.modelRoleRightRef.delete({ roleRightId, roleId });
    }

    // const roleRights = [
    //   { roleName: 'cms-writer', action: 'create' },
    //   { roleName: 'cms-writer', action: 'write', scopeNames: 0 },
    //   { roleName: 'cms-writer', action: 'delete', scopeNames: 0 },
    //   { roleName: 'cms-writer', action: 'read', scopeNames: 'authenticated' },
    //   { roleName: 'root', action: 'read', scopeNames: 'authenticated' },
    // ];
    async addRoleRightBatch({ module, atomClassName, atomClassIdParent = 0, roleRights }) {
      // module
      module = module || this.moduleName;
      // const _module = ctx.app.meta.modules[module];
      // atomClass
      const atomClass = await ctx.bean.atomClass.get({ module, atomClassName, atomClassIdParent });
      // roleRights
      if (!roleRights || !roleRights.length) return;
      for (const roleRight of roleRights) {
        // role
        const role = await this.parseRoleName({ roleName: roleRight.roleName, force: true });
        // scope
        let scope;
        if (!roleRight.scopeNames) {
          scope = 0;
        } else {
          scope = [];
          const scopeNames = Array.isArray(roleRight.scopeNames)
            ? roleRight.scopeNames
            : roleRight.scopeNames.split(',');
          for (const scopeName of scopeNames) {
            const roleScope = await this.get({ roleName: scopeName });
            scope.push(roleScope.id);
          }
        }
        // add role right
        const actionCode = ctx.bean.atomAction.parseActionCode({
          action: roleRight.action,
          atomClass: {
            module,
            atomClassName,
          },
        });
        await this.addRoleRight({
          roleId: role.id,
          atomClassId: atomClass.id,
          action: actionCode,
          scope,
        });
      }
    }

    // role rights
    async roleRights({ roleAtomId, roleId, page }) {
      roleId = await this._forceRoleId({ roleAtomId, roleId });
      page = ctx.bean.util.page(page, false);
      const _limit = ctx.model._limit(page.size, page.index);
      const list = await ctx.model.query(
        `
        select a.*,b.module,b.atomClassName,c.name as actionName,c.bulk as actionBulk from aRoleRight a
          left join aAtomClass b on a.atomClassId=b.id
          left join aAtomAction c on a.atomClassId=c.atomClassId and a.action=c.code
            where a.iid=? and a.roleId=?
            order by b.module,a.atomClassId,a.action
            ${_limit}
        `,
        [ctx.instance.id, roleId]
      );
      // scope
      for (const item of list) {
        const scope = JSON.parse(item.scope);
        item.scopeRoles = await this._scopeRoles({ scope });
      }
      return list;
    }

    // role spreads
    async roleSpreads({ roleAtomId, roleId, page }) {
      roleId = await this._forceRoleId({ roleAtomId, roleId });
      page = ctx.bean.util.page(page, false);
      const _limit = ctx.model._limit(page.size, page.index);
      const items = await ctx.model.query(
        `
        select d.*,d.id as roleExpandId,a.id as roleRightId,a.scope,b.module,b.atomClassName,c.code as actionCode,c.name as actionName,c.bulk as actionBulk,e.roleName as roleNameBase from aRoleRight a
          left join aAtomClass b on a.atomClassId=b.id
          left join aAtomAction c on a.atomClassId=c.atomClassId and a.action=c.code
          left join aRoleExpand d on a.roleId=d.roleIdBase
          left join aRole e on d.roleIdBase=e.id
            where d.iid=? and d.roleId=?
            order by b.module,a.atomClassId,a.action
            ${_limit}
        `,
        [ctx.instance.id, roleId]
      );
      // locale
      await this._atomRightsLocale({ items });
      // ok
      return items;
    }

    // atom rights of user
    async atomRightsOfUser({ userAtomId, userId, page }) {
      userId = await ctx.bean.user._forceUserId({ userAtomId, userId });
      page = ctx.bean.util.page(page, false);
      const _limit = ctx.model._limit(page.size, page.index);
      const items = await ctx.model.query(
        `
        select a.*,b.module,b.atomClassName,c.code as actionCode,c.name as actionName,c.bulk as actionBulk,e.roleName as roleNameBase from aViewUserRightAtomClass a
          left join aAtomClass b on a.atomClassId=b.id
          left join aAtomAction c on a.atomClassId=c.atomClassId and a.action=c.code
          left join aRole e on a.roleIdBase=e.id
            where a.iid=? and a.userIdWho=?
            order by b.module,a.atomClassId,a.action
            ${_limit}
        `,
        [ctx.instance.id, userId]
      );
      // locale
      await this._atomRightsLocale({ items });
      // ok
      return items;
    }

    async _atomRightsLocale({ items }) {
      for (const item of items) {
        // scope
        const scope = JSON.parse(item.scope);
        item.scopeRoles = await this._scopeRoles({ scope });
        // roleNameBase
        if (item.roleNameBase) {
          item.roleNameBaseLocale = ctx.text(item.roleNameBase);
        }
      }
    }

    async _scopeRoles({ scope }) {
      if (!scope || scope.length === 0) return null;
      const items = await ctx.model.query(
        `
            select a.* from aRole a
              where a.iid=? and a.id in (${scope.join(',')})
            `,
        [ctx.instance.id]
      );
      return this._translateRoleNamesLocale({ items });
    }

    _translateRoleNamesLocale({ items }) {
      for (const item of items) {
        item.roleNameLocale = ctx.text(item.roleName);
      }
      return items;
    }
  }

  return Role;
};
