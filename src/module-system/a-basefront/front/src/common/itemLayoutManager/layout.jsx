export default {
  data() {
    return {
      layout: {
        current: null,
        config: null,
        instance: null,
        instanceExtend: null,
      },
    };
  },
  created() {},
  beforeDestroy() {
    this.layout_destroyInstanceExtend();
  },
  methods: {
    layout_destroyInstanceExtend() {
      if (this.layout.instanceExtend) {
        this.layout.instanceExtend.$destroy();
        this.layout.instanceExtend = null;
      }
    },
    async layout_createInstanceExtend() {
      // config component
      const configComponent = this.$meta.util.getProperty(this.layout.config, 'extend.component');
      if (!configComponent) {
        this.layout_destroyInstanceExtend();
        return;
      }
      // load module
      const moduleExtend = await this.$meta.module.use(configComponent.module);
      // create extend
      const options = {
        propsData: {
          layoutManager: this,
        },
      };
      const component = moduleExtend.options.components[configComponent.name];
      if (!component) throw new Error(`extend.component not found: ${configComponent.module}:${configComponent.name}`);
      const instanceExtend = this.$meta.util.createComponentInstance(component, options);
      // ready
      this.layout_destroyInstanceExtend();
      this.layout.instanceExtend = instanceExtend;
    },
    async layout_setInstance(instance) {
      await this.layout_createInstanceExtend();
      this.layout.instance = instance;
    },
    layout_clearInstance(instance) {
      if (this.layout.instance === instance) {
        this.layout.instance = null;
      }
    },
    async layout_prepareConfig() {
      const atomClass = this.base.atomClass;
      // configAtomBase
      this.base.configAtomBase = this.$meta.config.modules['a-basefront'].atom;
      // configAtom
      this.base.configAtom = this.$meta.util.getProperty(
        this.$meta.config.modules[atomClass.module],
        `atoms.${atomClass.atomClassName}`
      );
      // special for cms
      const atomClassBase = this.getAtomClass(atomClass);
      if (atomClassBase.cms && !(atomClass.module === 'a-cms' && atomClass.atomClassName === 'article')) {
        await this.$meta.module.use('a-cms');
        const configCMS = this.$meta.util.getProperty(this.$meta.config.modules['a-cms'], 'atoms.article');
        this.base.configAtom = this.base.configAtom
          ? this.$meta.util.extend({}, configCMS, this.base.configAtom)
          : configCMS;
      }
      // config
      this.base.config = this.base.configAtom
        ? this.$meta.util.extend({}, this.base.configAtomBase, this.base.configAtom)
        : this.base.configAtomBase;
      // prepareConfigLayout
      this.layout_prepareConfigLayout();
    },
    layout_getDefault() {
      const layoutConfigKeyCurrent = this.base_getLayoutConfigKeyCurrent();
      const configCurrent = this.base.layoutConfig[layoutConfigKeyCurrent];
      if (configCurrent) return configCurrent;
      // from config
      const configViewSize = this.$meta.util.getProperty(this.base.config, 'render.item.info.layout.viewSize');
      let layouts = configViewSize[this.container.mode][this.$view.size];
      if (!Array.isArray(layouts)) {
        layouts = [layouts];
      }
      return layouts[0].name;
    },
    layout_prepareConfigLayout(layoutCurrent) {
      // current
      this.layout.current = layoutCurrent || this.container.layout || this.layout_getDefault();
      // layoutConfig
      let config = this.$meta.util.getProperty(this.base.config, `render.item.layouts.${this.layout.current}`);
      if (!config) {
        config = this.$meta.util.getProperty(this.base.config, 'render.item.layouts.default');
      }
      if (!config) return false;
      const configBase = this.$meta.util.getProperty(this.base.config, 'render.item.layouts.base');
      this.layout.config = configBase ? this.$meta.util.extend({}, configBase, config) : config;
      return true;
    },
    async layout_switchLayout(layoutCurrent) {
      if (layoutCurrent === this.layout.current) return true;
      // force clear status
      this.layout.current = null;
      this.layout.config = null;
      // this.layout.instance = null;
      this.subnavbar.enable = false;
      this.subnavbar.render = false;
      // prepare
      if (!this.layout_prepareConfigLayout(layoutCurrent)) {
        return false;
      }
      // save
      const layoutConfigKeyCurrent = this.base_getLayoutConfigKeyCurrent();
      this.$store.commit('a/base/setLayoutConfigKey', {
        module: 'a-basefront',
        key: layoutConfigKeyCurrent,
        value: layoutCurrent,
      });
      return true;
    },
    layout_getComponentOptions() {
      return {
        props: {
          layoutManager: this,
          layoutConfig: this.layout.config,
        },
      };
    },
    layout_renderComponent() {
      if (!this.base.ready) return null;
      return (
        <eb-component
          module={this.layout.config.component.module}
          name={this.layout.config.component.name}
          options={this.layout_getComponentOptions()}
        ></eb-component>
      );
    },
    layout_getBlockComponentOptions({ blockConfig }) {
      return {
        props: {
          layoutManager: this,
          layout: this.layout.instance,
          blockConfig,
        },
      };
    },
    layout_renderBlock({ blockName }) {
      if (!this.base.ready) return null;
      if (!this.layout.instance) return null;
      const blockConfig = this.layout.config.blocks[blockName];
      if (!blockConfig) {
        const errorMessage = `${this.$text('Block Not Found')}: ${blockName}`;
        return <div>{errorMessage}</div>;
      }
      const blockOptions = this.layout_getBlockComponentOptions({ blockConfig });
      return (
        <eb-component
          module={blockConfig.component.module}
          name={blockConfig.component.name}
          options={blockOptions}
        ></eb-component>
      );
    },
    layout_renderSubnavbar() {
      if (!this.base.ready) return null;
      if (!this.layout.instance || !this.subnavbar.enable) return null;
      return this.layout_renderBlock({ blockName: 'subnavbar' });
    },
    layout_renderLayout() {
      if (this.base.notfound) {
        return (
          <f7-card>
            <f7-card-header>{this.$text('Friendly Tips')}</f7-card-header>
            <f7-card-content>{this.$text('Not Found')}</f7-card-content>
          </f7-card>
        );
      }
      return (
        <div>
          {this.layout_renderComponent()}
          {this.actions_renderPopover()}
        </div>
      );
    },
    layout_renderCaptionInit() {
      if (this.base.ready) return null;
      return (
        <f7-nav-title>
          <div>{this.page_title}</div>
        </f7-nav-title>
      );
    },
    layout_renderPage() {
      return (
        <eb-page withSubnavbar={this.subnavbar.enable}>
          <eb-navbar eb-back-link="Back">
            {this.layout_renderCaptionInit()}
            {this.layout_renderBlock({ blockName: 'caption' })}
            {this.layout_renderBlock({ blockName: 'title' })}
            {this.layout_renderSubnavbar()}
          </eb-navbar>
          {this.layout_renderLayout()}
        </eb-page>
      );
    },
  },
};
