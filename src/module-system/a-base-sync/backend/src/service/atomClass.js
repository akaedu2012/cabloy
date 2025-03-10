module.exports = app => {
  class AtomClass extends app.Service {
    async validatorSearch({ atomClass }) {
      return await this.ctx.bean.atomClass.validatorSearch({ atomClass });
    }

    async checkRightCreate({ atomClass, user }) {
      return await this.ctx.bean.atom.checkRightCreate({ atomClass, user });
    }

    async atomClass({ atomClass }) {
      return await this.ctx.bean.atomClass.get(atomClass);
    }

    async atomClassesUser({ user }) {
      return await this.ctx.bean.atomClass.atomClassesUser({ user });
    }

    async actionsUser({ atomClass, user }) {
      return await this.ctx.bean.atomClass.actionsUser({ atomClass, user });
    }
  }

  return AtomClass;
};
