export default {
  meta: {
    global: false,
  },
  props: {
    layoutManager: {
      type: Object,
    },
    blockConfig: {
      type: Object,
    },
  },
  data() {
    return {
    };
  },
  methods: {
    _renderActionsLeft() {
      const children = this.layoutManager.info_rendActionsLeft();
      return (
        <div class="actions-block actions-block-left">
          {children}
        </div>
      );
    },
    _renderActionsRight() {
      const children = this.layoutManager.info_rendActionsRight();
      return (
        <div class="actions-block actions-block-right">
          {children}
        </div>
      );
    },
  },
  render() {
    return (
      <f7-subnavbar>
        <div class="atom-item-subnavbar-container">
          {this._renderActionsLeft()}
          {this._renderActionsRight()}
        </div>
      </f7-subnavbar>
    );
  },
};
