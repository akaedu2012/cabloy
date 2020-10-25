module.exports = app => {

  class AtomController extends app.Controller {

    async preferredRoles() {
      const res = await this.ctx.service.atom.preferredRoles({
        atomClass: this.ctx.request.body.atomClass,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }
    async create() {
      const res = await this.ctx.service.atom.create({
        atomClass: this.ctx.request.body.atomClass,
        roleIdOwner: this.ctx.request.body.roleIdOwner,
        item: this.ctx.request.body.item,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async read() {
      const res = await this.ctx.service.atom.read({
        key: this.ctx.request.body.key,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    // options
    //   where, orders, page, star, label
    async select() {
      const options = this.ctx.request.body.options;
      options.page = this.ctx.bean.util.page(options.page);
      const items = await this.ctx.service.atom.select({
        atomClass: this.ctx.request.body.atomClass,
        options,
        user: this.ctx.state.user.op,
      });
      this.ctx.successMore(items, options.page.index, options.page.size);
    }

    async count() {
      const options = this.ctx.request.body.options;
      const count = await this.ctx.service.atom.count({
        atomClass: this.ctx.request.body.atomClass,
        options,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(count);
    }

    async write() {
      await this.ctx.service.atom.write({
        key: this.ctx.request.body.key,
        item: this.ctx.request.body.item,
        user: this.ctx.state.user.op,
      });
      this.ctx.success();
    }

    async openDraft() {
      const res = await this.ctx.service.atom.openDraft({
        key: this.ctx.request.body.key,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async submit() {
      const options = this.ctx.request.body.options || {};
      if (!app.meta.isTest) {
        options.ignoreFlow = false;
      }
      // submit
      const res = await this.ctx.service.atom.submit({
        key: this.ctx.request.body.key,
        options,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async writeSubmit() {
      // write
      await this.ctx.service.atom.write({
        key: this.ctx.request.body.key,
        item: this.ctx.request.body.item,
        user: this.ctx.state.user.op,
      });
      // submit
      await this.submit();
    }

    async delete() {
      await this.ctx.service.atom.delete({
        key: this.ctx.request.body.key,
        user: this.ctx.state.user.op,
      });
      this.ctx.success();
    }

    async deleteBulk() {
      const res = await this.ctx.service.atom.deleteBulk({
        atomClass: this.ctx.request.body.atomClass,
        keys: this.ctx.request.body.keys,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async clone() {
      const res = await this.ctx.service.atom.clone({
        key: this.ctx.request.body.key,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async exportBulk() {
      const res = await this.ctx.service.atom.exportBulk({
        atomClass: this.ctx.request.body.atomClass,
        options: this.ctx.request.body.options,
        fields: this.ctx.request.body.fields,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async star() {
      const res = await this.ctx.service.atom.star({
        key: this.ctx.request.body.key,
        atom: this.ctx.request.body.atom,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async readCount() {
      const res = await this.ctx.service.atom.readCount({
        key: this.ctx.request.body.key,
        atom: this.ctx.request.body.atom,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async stats() {
      // atomIds
      const atomIds = this.ctx.request.body.atomIds;
      const options = {
        where: {
          'a.id': { op: 'in', val: atomIds },
        },
      };
      // select
      const res = await this.ctx.bean.atom.select({
        options, user: this.ctx.state.user.op, pageForce: false,
      });
      this.ctx.success(res);
    }

    async labels() {
      const res = await this.ctx.service.atom.labels({
        key: this.ctx.request.body.key,
        atom: this.ctx.request.body.atom,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async actions() {
      const res = await this.ctx.service.atom.actions({
        key: this.ctx.request.body.key,
        basic: this.ctx.request.body.basic,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async actionsBulk() {
      const res = await this.ctx.service.atom.actionsBulk({
        atomClass: this.ctx.request.body.atomClass,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async schema() {
      const res = await this.ctx.service.atom.schema({
        atomClass: this.ctx.request.body.atomClass,
        schema: this.ctx.request.body.schema,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async validator() {
      const res = await this.ctx.service.atom.validator({
        atomClass: this.ctx.request.body.atomClass,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

  }
  return AtomController;
};

