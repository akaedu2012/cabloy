module.exports = app => {
  class ResourceRight extends app.Service {
    async rights({ roleAtomId, page, user }) {
      return await this.ctx.bean.resource.resourceRights({ roleAtomId, page, user });
    }

    async add({ roleAtomId, atomIds, user }) {
      return await this.ctx.bean.resource.addResourceRoles({ roleAtomId, atomIds, user });
    }

    async delete({ roleAtomId, resourceRightId, user }) {
      return await this.ctx.bean.resource.deleteResourceRole({ roleAtomId, resourceRightId, user });
    }

    async spreads({ roleAtomId, page, user }) {
      return await this.ctx.bean.resource.resourceSpreads({ roleAtomId, page, user });
    }
  }

  return ResourceRight;
};
