import Vue from 'vue';
import appMethods from '../common/appMethods.js';
const f7View = Vue.options.components['f7-view'].extendOptions;
export default {
  meta: {
    global: true,
  },
  name: 'eb-view',
  extends: f7View,
  props: {
    size: {
      type: String,
      default: 'small',
    },
    sizeExtent: {
      type: Object,
    },
  },
  data() {
    return appMethods(this);
  },
  methods: {
    getViewDirty() {
      const pages = this.routerData.pages;
      for (const page of pages) {
        const pageVue = page.el.__vue__;
        if (pageVue && pageVue.getPageDirty && pageVue.getPageDirty()) return true;
      }
      return false;
    },
    viewDirtyConfirm(cbOk, cbCancel) {
      const _promise = this.dialog.confirm(this.$text('PageDirtyQuitConfirm'));
      if (!cbOk) return _promise;
      _promise
        .then(() => {
          cbOk && cbOk();
        })
        .catch(() => {
          cbCancel && cbCancel();
        });
    },
    getHostEl() {
      const view = this.$$(this.$el);
      const views = view.parents('.views');
      return views.length > 0 ? views : view;
    },
    navigate(url, options) {
      let _options = options || {};
      if (!_options.ctx) {
        // _options = this.$utils.extend({}, _options, { ctx: this });
        _options = Object.assign({}, _options, { ctx: this });
      }
      this.$meta.vueLayout.navigate(url, _options);
    },
    getSizeExtent() {
      return this.sizeExtent;
      // not valid if the group of views is hidden
      // const view = this.$$(this.$el);
      // const size = {
      //   width: view.width(),
      //   height: view.height(),
      // };
      // return size;
    },
    close() {
      this.$f7router.close();
    },
    inPanel() {
      const view = this.$$(this.$el);
      return view.is('.eb-layout-panel-view');
    },
    returnTo(returnTo, options) {
      if (!returnTo) {
        const modeIfEmpty = (options && options.modeIfEmpty) || 'back';
        if (modeIfEmpty === 'back') {
          this.$f7router.back();
        } else {
          this.$view.close();
        }
      } else if (returnTo.indexOf('http://') === 0 || returnTo.indexOf('https://') === 0) {
        window.location.assign(returnTo);
      } else {
        const navigateOptions = (options && options.navigateOptions) || { target: '_self', reloadCurrent: true };
        this.$view.navigate(returnTo, navigateOptions);
      }
    },
  },
  mounted() {
    const self = this;
    const el = self.$refs.el;
    self.$f7ready(f7Instance => {
      if (self.props.init) return;
      self.routerData.instance = f7Instance.views.create(
        el,
        Object.assign(
          {
            on: {
              init: self.onViewInit,
            },
          },
          noUndefinedProps(self.$options.propsData || {})
        )
      );
      self.f7View = self.routerData.instance;
      self.f7View.on('swipebackMove', self.onSwipeBackMove);
      self.f7View.on('swipebackBeforeChange', self.onSwipeBackBeforeChange);
      self.f7View.on('swipebackAfterChange', self.onSwipeBackAfterChange);
      self.f7View.on('swipebackBeforeReset', self.onSwipeBackBeforeReset);
      self.f7View.on('swipebackAfterReset', self.onSwipeBackAfterReset);
      // viewReady
      this.$emit('view:ready', self);
    });
  },
  beforeDestroy() {
    const self = this;
    this.$emit('view:destroy', self);
    //
    this.calendar = null;
    this.toast = null;
    this.dialog = null;
  },
};

function noUndefinedProps(obj) {
  const o = {};
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] !== 'undefined') o[key] = obj[key];
  });
  return o;
}
