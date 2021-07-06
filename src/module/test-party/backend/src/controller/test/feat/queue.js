const require3 = require('require3');
const assert = require3('assert');

module.exports = app => {
  class QueueController extends app.Controller {
    async pushAsync() {
      const res = await this.ctx.app.meta.queue.pushAsync({
        locale: this.ctx.locale,
        subdomain: this.ctx.subdomain,
        module: 'test-party',
        queueName: 'queueTest',
        data: { a: 1, b: 2 },
      });
      assert.equal(res, 3);
      this.ctx.success();
    }

    async push() {
      this.ctx.app.meta.queue.push({
        locale: this.ctx.locale,
        subdomain: this.ctx.subdomain,
        module: 'test-party',
        queueName: 'queueTest',
        data: { a: 1, b: 2 },
      });
      this.ctx.success();
    }
  }

  return QueueController;
};
