export default {
  meta: {
    global: false,
  },
  props: {
    layoutManager: {
      type: Object,
    },
    layout: {
      type: Object,
    },
    layoutItems: {
      type: Object,
    },
    info: {
      type: Object,
    },
    mapper: {
      type: Object,
    },
  },
  data() {
    return {};
  },
  created() {},
  methods: {
    onItemClick(event) {
      return this.layoutManager.item_onActionView(event, this.info.record);
    },
    _renderMedia() {
      let avatarFieldName = this.mapper && this.mapper.avatar;
      if (!avatarFieldName) return;
      if (avatarFieldName === true) {
        avatarFieldName = undefined;
      }
      return this.layoutManager.item_renderMedia(
        this.info.record,
        'avatar avatar24 eb-vertical-align',
        avatarFieldName
      );
    },
  },
  render() {
    const item = this.info.record;
    // domAfter
    const domAfterMetaFlags = this.layoutManager.item_renderMetaFlags(item);
    const domAfterLabels = this.layoutManager.item_renderLabels(item);
    // domSummary
    const domSummary = <div class="atomName-summary">{this.layoutManager.item_getMetaSummary(item)}</div>;
    // domMedia
    const domMedia = this._renderMedia();
    return (
      <div class="atom-list-layout-table-cell-atomName">
        <div class="atomName-inner">
          <div class="atomName-left">
            <eb-link propsOnPerform={event => this.onItemClick(event)}>
              {domMedia}
              {this.layoutManager.item_getAtomName(item)}
            </eb-link>
          </div>
          <div class="atomName-right">
            <span class="stats">{this.layoutManager.item_renderStats(item)}</span>
            {domAfterMetaFlags}
            {domAfterLabels}
          </div>
        </div>
        {domSummary}
      </div>
    );
  },
};
