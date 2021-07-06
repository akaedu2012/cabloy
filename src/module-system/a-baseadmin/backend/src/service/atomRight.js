module.exports = app => {
  class AtomRight extends app.Service {
    async rights({ roleId, page }) {
      return await this.ctx.bean.role.roleRights({ roleId, page });
    }

    async add({ roleId, atomClass, actionCode, scopeSelf, scope }) {
      const _atomClass = await this.ctx.bean.atomClass.get(atomClass);
      if (scopeSelf) {
        scope = 0;
      }
      return await this.ctx.bean.role.addRoleRight({
        roleId,
        atomClassId: _atomClass.id,
        action: actionCode,
        scope,
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
