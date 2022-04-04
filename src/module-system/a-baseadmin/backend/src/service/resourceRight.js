module.exports = app => {
  class ResourceRight extends app.Service {
    async rights({ roleAtomId, page, user }) {
      return await this.ctx.bean.resource.resourceRights({ roleAtomId, page, user });
    }

    async add({ roleId, atomIds }) {
      return await this.ctx.bean.resource.addResourceRoles({ roleId, atomIds });
    }

    async delete({ id }) {
      return await this.ctx.bean.resource.deleteResourceRole({ id });
    }

    async spreads({ roleId, page }) {
      return await this.ctx.bean.resource.resourceSpreads({ roleId, page });
    }
  }

  return ResourceRight;
};
