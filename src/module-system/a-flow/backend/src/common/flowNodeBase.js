module.exports = class FlowNodeBase {
  constructor(ctx, options) {
    this.ctx = ctx;
    if (options) {
      this.flowInstance = options.flowInstance;
      this.nodeInstance = options.nodeInstance;
      this.context = options.context;
      this.contextNode = options.contextNode;
    }
  }

  async onNodeEnter() {
    await this.flowInstance._flowListener.onNodeEnter(this.contextNode);
    return true;
  }

  async onNodeBegin() {
    await this.flowInstance._flowListener.onNodeBegin(this.contextNode);
    return true;
  }

  async onNodeDoing() {
    await this.flowInstance._flowListener.onNodeDoing(this.contextNode);
    return true;
  }

  async onNodeEnd() {
    await this.flowInstance._flowListener.onNodeEnd(this.contextNode);
    return true;
  }

  async onNodeLeave() {
    // listener
    await this.flowInstance._flowListener.onNodeLeave(this.contextNode);
    // save nodeVars
    await this.nodeInstance._saveNodeVars();
    // save flowVars
    await this.flowInstance._saveFlowVars();
    // ok
    return true;
  }

};

