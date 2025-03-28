export default {
  data() {
    return {};
  },
  methods: {
    layout_onGetLayoutConfigKeyCurrent() {
      const messageClassKey = null;
      return `message.${messageClassKey}.render.group.layout.current.${this.$view.size}`;
    },
    async layout_onPrepareConfigFull() {
      // configMessageBase
      const layoutItem = await this.$store.dispatch('a/baselayout/getLayoutItem', {
        layoutKey: 'a-message:layoutMessageGroupBase',
      });
      this.base.configMessageBase = layoutItem.content;
      // ok
      return this.base.configMessageBase;
    },
  },
};
