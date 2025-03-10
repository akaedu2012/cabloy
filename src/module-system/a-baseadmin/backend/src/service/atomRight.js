module.exports = app => {
  class AtomRight extends app.Service {
    async rights({ roleAtomId, page, user }) {
      return await this.ctx.bean.role.roleRights({ roleAtomId, page, user });
    }

    async add({ roleAtomId, atomClass, actionCode, scopeSelf, scope, areaKey, areaScope, user }) {
      const _atomClass = await this.ctx.bean.atomClass.get(atomClass);
      if (scopeSelf) {
        scope = 0;
      }
      return await this.ctx.bean.role.addRoleRight({
        roleAtomId,
        atomClassId: _atomClass.id,
        action: actionCode,
        scope,
        areaKey,
        areaScope,
        user,
      });
    }

    async delete({ roleAtomId, roleRightId, user }) {
      return await this.ctx.bean.role.deleteRoleRight({ roleAtomId, roleRightId, user });
    }

    async spreads({ roleAtomId, page, user }) {
      return await this.ctx.bean.role.roleSpreads({ roleAtomId, page, user });
    }
  }

  return AtomRight;
};
