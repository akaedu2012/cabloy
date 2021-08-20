import Vue from 'vue';
import Base from './base.jsx';
import Page from './page.jsx';
import Layout from './layout.jsx';
import Subnavbar from './subnavbar.jsx';
import Info from './info.jsx';
import Actions from './actions.jsx';
import Validate from './validate.jsx';
import Share from './share.jsx';
const ebAtomClasses = Vue.prototype.$meta.module.get('a-base').options.mixins.ebAtomClasses;
const ebAtomActions = Vue.prototype.$meta.module.get('a-base').options.mixins.ebAtomActions;
const ebPageDirty = Vue.prototype.$meta.module.get('a-components').options.mixins.ebPageDirty;

// container: {
//   mode,  // edit/view
//   atomId,
//   itemId,
//   layout,
// },

export default {
  mixins: [
    ebAtomClasses, //
    ebAtomActions,
    ebPageDirty,
    Base,
    Page,
    Layout,
    Subnavbar,
    Info,
    Actions,
    Validate,
    Share,
  ],
  data() {
    return {};
  },
  created() {
    this.index_load();
  },
  beforeDestroy() {
    this.$emit('layoutManager:destroy');
  },
  methods: {
    async index_load() {
      await this.base_init();
      const res = await this.base_loadItem();
      if (!res) return;
      await this.layout_prepareConfig();
      await this.share_updateLink();
      this.base.ready = true;
    },
  },
};
