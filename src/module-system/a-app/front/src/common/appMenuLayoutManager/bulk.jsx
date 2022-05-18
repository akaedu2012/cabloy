export default {
  data() {
    return {};
  },
  methods: {
    bulk_onPerformAppDefault() {
      const __appKeyDefault = this.$config.appKey.default;
      this.$meta.vueLayout.app_openHome({
        view: this.$view,
        appKey: __appKeyDefault,
      });
    },
    bulk_onPerformSearch() {
      this.$view.navigate('/a/basefront/atom/searchQuick', {
        target: '_self',
      });
    },
    async bulk_onPerformLanguage(event) {
      // get current
      const current = this.$store.getters['a/app/current'];
      const _action = {
        actionModule: 'a-base',
        actionComponent: 'action',
        name: 'selectLocale',
        targetEl: event.currentTarget,
      };
      const localeCurrent = {
        value: current.appLanguage,
      };
      const locale = await this.$meta.util.performAction({
        ctx: this,
        action: _action,
        item: { current: localeCurrent },
      });
      // set current
      if (locale) {
        this.$meta.store.commit('a/app/setCurrent', { appLanguage: locale.value });
      }
    },
    bulk_renderAppDefault() {
      // layout
      if (this.$meta.vueApp.layout !== 'mobile') return null;
      // backLink
      const backLink = this.$meta.vueLayout.backLink(this.$view);
      if (backLink) return null;
      // childMode
      if (!this.base_isChildMode()) return null;
      return (
        <eb-link
          key="appDefault"
          iconF7=":outline:apps-outline"
          propsOnPerform={this.bulk_onPerformAppDefault}
        ></eb-link>
      );
    },
    bulk_renderSearch() {
      // layout
      if (this.$meta.vueApp.layout !== 'mobile') return null;
      return <eb-link key="search" iconF7="::search" propsOnPerform={this.bulk_onPerformSearch}></eb-link>;
    },
    bulk_renderLanguage() {
      if (!this.base.appItem.appLanguage) return null;
      // get current
      const current = this.$store.getters['a/app/current'];
      const lang = current.appLanguage.split('-')[0];
      const title = lang.replace(lang[0], lang[0].toUpperCase());
      return (
        <eb-link key="language" propsOnPerform={this.bulk_onPerformLanguage}>
          {title}
        </eb-link>
      );
    },
    bulk_renderActionsNormal() {
      const children = [];
      // appDefault
      children.push(this.bulk_renderAppDefault());
      // search
      children.push(this.bulk_renderSearch());
      // language
      children.push(this.bulk_renderLanguage());
      // ok
      return children;
    },
  },
};
