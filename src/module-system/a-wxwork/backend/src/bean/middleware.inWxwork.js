module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Middleware {
    async execute(options, next) {
      if (
        !ctx.bean.wxwork.util.in({
          providerName: options.providerName,
          providerScene: options.providerScene,
        })
      ) {
        return ctx.throw.module(moduleInfo.relativeName, 1001);
      }
      // next
      await next();
    }
  }
  return Middleware;
};
