export default {
  meta: {
    global: false,
  },
  props: {
    layoutManager: {
      type: Object,
    },
    layoutConfig: {
      type: Object,
    },
  },
  data() {
    return {
      treeviewData: null,
    };
  },
  created() {
    this.init();
  },
  beforeDestroy() {
    this.treeviewData = null;
    this.layoutManager.layout_clearInstance(this);
  },
  methods: {
    async init() {
      // subnavbar
      if (this.layoutConfig.subnavbar && this.layoutConfig.subnavbar.policyDefault) {
        this.layoutManager.subnavbar_policyDefault();
      }
      // provider switch
      const providerOptions = this.layoutConfig.providerOptions || {
        providerName: 'tree',
      };
      const res = await this.layoutManager.data_providerSwitch(providerOptions);
      this.treeviewData = res.treeviewData;
      // instance
      await this.layoutManager.layout_setInstance(this);
    },
  },
  render() {
    const blockName = this.layoutConfig.blockItems || 'items';
    return <div>{this.layoutManager.layout_renderBlock({ blockName })}</div>;
  },
};
