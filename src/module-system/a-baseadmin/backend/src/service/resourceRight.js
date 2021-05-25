module.exports = app => {

  class ResourceRight extends app.Service {

    async rights({ roleId, page }) {
      return await this.ctx.bean.resource.resourceRights({ roleId, page });
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
      return await this.ctx.bean.resource.resourceSpreads({ roleId, page });
    }

  }

  return ResourceRight;
};
