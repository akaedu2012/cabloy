module.exports = app => {
  class cli extends app.Service {
    async meta({ context, user }) {
      return await this.ctx.bean.cli.meta({ context, user });
    }

    async execute({ progressId, context, user }) {
      return await this.ctx.bean.cli.execute({ progressId, context, user });
    }
  }

  return cli;
};
