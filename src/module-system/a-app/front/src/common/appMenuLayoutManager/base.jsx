export default {
  data() {
    return {
      base: {
        configAppMenuBase: null,
        configAppMenuCmsBase: null,
        configAppMenu: null,
        //
        appInfoCurrent: {},
        appMenuInited: false,
      },
    };
  },
  computed: {
    base_atomClassApp() {
      return {
        module: 'a-app',
        atomClassName: 'app',
      };
    },
    base_appCurrent() {
      return this.$store.getters['a/app/current'];
    },
    base_appLanguageCurrent() {
      return this.base_appCurrent.appLanguage;
    },
  },
  watch: {
    base_appLanguageCurrent() {
      if (!this.base.appMenuInited) return;
      if (!this.$meta.vueLayout.started) return;
      this.base_app_switch();
    },
  },
  beforeDestroy() {
    this.base.appMenuInited = false;
  },
  methods: {
    async base_onInit() {
      await this.base_app_prepareAppCurrent();
      this.base.appMenuInited = true;
    },
    async base_app_switch() {
      // prepareAppCurrent
      const res = await this.base_app_prepareAppCurrent();
      if (!res) return;
      // prepareConfigLayout
      this.layout.configFull = null;
      await this.layout_prepareConfigLayout(this.layout.current);
    },
    async base_app_prepareAppCurrent() {
      const appKey = this.container.appKey;
      const appInfo = await this.$store.dispatch('a/app/getAppMenuInfo', { appKey });
      if (!appInfo) return false;
      if (this.base_app_isCurrentSameFull(this.base.appInfoCurrent, appInfo)) return false;
      // current
      this.base.appInfoCurrent = appInfo;
      // configAppMenu
      if (appInfo.appMenuLayout) {
        const layoutItem = await this.$store.dispatch('a/baselayout/getLayoutItem', {
          layoutKey: appInfo.appMenuLayout,
        });
        this.base.configAppMenu = layoutItem.content;
      } else {
        this.base.configAppMenu = null;
      }
      // ok
      return true;
    },
    base_app_isCurrentSame(a, b) {
      // only check appKey
      return a.appKey === b.appKey;
    },
    base_app_isCurrentSameFull(a, b) {
      // not check appLanguage
      return a.appKey === b.appKey && a.appMenuLayout === b.appMenuLayout;
    },
    async base_onPerformResource(event, resource) {
      return await this.base_performActionResource(event, resource);
    },
    base_isChildMode() {
      const __appKeyDefault = this.$config.appKey.default;
      if (this.container.appKey === __appKeyDefault) return false;
      if (!this.base.appInfoCurrent.appItem) return false;
      if (this.base.appInfoCurrent.appItem.appIsolate) return false;
      return true;
    },
  },
};
