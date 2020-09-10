module.exports = app => {

  class FunctionController extends app.Controller {

    // options
    //   where, orders, page, star,language
    async list() {
      const options = this.ctx.request.body.options || {};
      options.page = this.ctx.bean.util.page(options.page, false); // false
      // locale maybe '' for selectAllFunctions
      if (options.locale === undefined) options.locale = this.ctx.locale;
      const items = await this.ctx.service.function.list({
        options,
        user: this.ctx.state.user.op,
      });
      this.ctx.successMore(items, options.page.index, options.page.size);
    }

    async star() {
      const res = await this.ctx.service.function.star({
        id: this.ctx.request.body.id,
        star: this.ctx.request.body.star,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async check() {
      const res = await this.ctx.service.function.check({
        functions: this.ctx.request.body.functions,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async scenes() {
      const res = await this.ctx.service.function.scenes({
        sceneMenu: this.ctx.request.body.sceneMenu,
      });
      this.ctx.success(res);
    }

  }

  return FunctionController;
};
