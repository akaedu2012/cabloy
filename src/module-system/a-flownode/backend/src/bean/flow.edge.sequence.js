module.exports = ctx => {
  class FlowEdge extends ctx.app.meta.FlowEdgeBase {
    constructor(options) {
      super(ctx, options);
    }

    async onEdgeEnter() {
      // super
      let res = await super.onEdgeEnter();
      if (!res) return false;
      // check conditionExpression
      const conditionExpression =
        this.contextEdge._edgeDef.options && this.contextEdge._edgeDef.options.conditionExpression;
      // return true on empty/null/undefined
      if (!conditionExpression && conditionExpression !== false) return true;
      if (conditionExpression === false) return false;
      // contextNodePrevious
      const contextNodePrevious = this.contextNode.contextEdge && this.contextNode.contextEdge.contextNode;
      // evaluateExpression
      res = ctx.bean.flow.evaluateExpression({
        expression: conditionExpression,
        globals: {
          context: this.context,
          contextNode: this.contextNode,
          contextEdge: this.contextEdge,
          contextNodePrevious,
        },
      });
      return !!res;
    }
  }

  return FlowEdge;
};
