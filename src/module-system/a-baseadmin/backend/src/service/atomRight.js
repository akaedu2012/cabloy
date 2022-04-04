module.exports = app => {
  class AtomRight extends app.Service {
    async rights({ roleAtomId, page, user }) {
      return await this.ctx.bean.role.roleRights({ roleAtomId, page, user });
    }

    async add({ roleAtomId, atomClass, actionCode, scopeSelf, scope, user }) {
      const _atomClass = await this.ctx.bean.atomClass.get(atomClass);
      if (scopeSelf) {
        scope = 0;
      }
      return await this.ctx.bean.role.addRoleRight({
        roleAtomId,
        atomClassId: _atomClass.id,
        action: actionCode,
        scope,
        user,
      });
    }

    async delete({ id }) {
      return await this.ctx.bean.role.deleteRoleRight({ id });
    }

    async spreads({ roleId, page }) {
      return await this.ctx.bean.role.roleSpreads({ roleId, page });
    }
  }

  return AtomRight;
};
