const flowNode_0 = require('./local.flow.node/local.flow.node_0.js');
const flowNode_cycle = require('./local.flow.node/local.flow.node_cycle.js');
module.exports = ctx => {
  return ctx.app.meta.util.mixinClasses(flowNode_0, [flowNode_cycle], ctx);
};
