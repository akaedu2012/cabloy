const path = require('path');
const require3 = require('require3');
const fse = require3('fs-extra');
const extend = require3('extend2');

const _modulesLocales = {};
const _themesLocales = {};
const _locales = {};
const _localeModules = {};
const _resourceTypes = {};
const _atomClasses = {};
const _actions = {};
const _authProvidersLocales = {};

let _hostText = null;

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Base extends ctx.app.meta.BeanModuleBase {

    constructor(moduleName) {
      super(ctx, 'base');
      this.moduleName = moduleName || ctx.module.info.relativeName;
    }

    get host() {
      // test
      if (ctx.app.meta.isTest) {
        if (_hostText) return _hostText;
        const buildConfig = require3(path.join(process.cwd(), 'build/config.js'));
        const hostname = buildConfig.front.dev.hostname || 'localhost';
        const port = buildConfig.front.dev.port;
        _hostText = `${hostname}:${port}`;
        return _hostText;
      }
      // others
      const config = ctx.config.module(moduleInfo.relativeName);
      return config.host || ctx.host;
    }

    get protocol() {
      const config = ctx.config.module(moduleInfo.relativeName);
      return config.protocol || ctx.protocol;
    }

    getAbsoluteUrl(path) {
      const prefix = this.host ? `${this.protocol}://${this.host}` : '';
      return `${prefix}${path || ''}`;
    }

    // get forward url
    getForwardUrl(path) {
      const prefix = (ctx.app.meta.isTest || ctx.app.meta.isLocal) ? ctx.app.config.static.prefix + 'public/' : '/public/';
      return `${prefix}${ctx.subdomain || 'default'}/${path}`;
    }

    // get root path
    async getRootPath() {
      if (ctx.app.meta.isTest || ctx.app.meta.isLocal) {
        return ctx.app.config.static.dir;
      }
      const dir = ctx.config.module(moduleInfo.relativeName).publicDir || path.join(require('os').homedir(), 'cabloy', ctx.app.name, 'public');
      await fse.ensureDir(dir);
      return dir;
    }

    // get path
    async getPath(subdir, ensure) {
      const rootPath = await this.getRootPath();
      // use subdomain, not instance.id
      const dir = path.join(rootPath, ctx.subdomain || 'default', subdir || '');
      if (ensure) {
        await fse.ensureDir(dir);
      }
      return dir;
    }

    // static
    getStaticUrl(path) {
      return this.getAbsoluteUrl(`/api/static${path}`);
    }

    // alert
    getAlertUrl({ data }) {
      return this.getAbsoluteUrl(`/#!/a/basefront/base/alert?data=${encodeURIComponent(JSON.stringify(data))}`);
    }

    modules() {
      if (!_modulesLocales[ctx.locale]) {
        _modulesLocales[ctx.locale] = this._prepareModules();
      }
      return _modulesLocales[ctx.locale];
    }

    themes() {
      if (!_themesLocales[ctx.locale]) {
        _themesLocales[ctx.locale] = this._prepareThemes();
      }
      return _themesLocales[ctx.locale];
    }

    locales() {
      if (!_locales[ctx.locale]) {
        _locales[ctx.locale] = this._prepareLocales();
      }
      return _locales[ctx.locale];
    }

    localeModules() {
      if (!_localeModules[ctx.locale]) {
        _localeModules[ctx.locale] = this._prepareLocaleModules();
      }
      return _localeModules[ctx.locale];
    }

    resourceTypes() {
      if (!_resourceTypes[ctx.locale]) {
        _resourceTypes[ctx.locale] = this._prepareResourceTypes();
      }
      return _resourceTypes[ctx.locale];
    }

    atomClasses() {
      if (!_atomClasses[ctx.locale]) {
        _atomClasses[ctx.locale] = this._prepareAtomClasses();
      }
      return _atomClasses[ctx.locale];
    }

    atomClass({ module, atomClassName }) {
      const _atomClasses = this.atomClasses();
      return _atomClasses[module] && _atomClasses[module][atomClassName];
    }

    actions() {
      if (!_actions[ctx.locale]) {
        _actions[ctx.locale] = this._prepareActions();
      }
      return _actions[ctx.locale];
    }

    action({ module, atomClassName, code, name }) {
      const _actions = this.actions();
      const actions = _actions[module][atomClassName];
      if (name) return actions[name];
      const key = Object.keys(actions).find(key => actions[key].code === code);
      return actions[key];
    }

    authProviders() {
      const subdomain = ctx.subdomain;
      if (!_authProvidersLocales[subdomain]) _authProvidersLocales[subdomain] = {};
      const authProvidersSubdomain = _authProvidersLocales[subdomain];
      if (!authProvidersSubdomain[ctx.locale]) {
        authProvidersSubdomain[ctx.locale] = this._prepareAuthProviders();
      }
      return authProvidersSubdomain[ctx.locale];
    }

    authProvidersReset() {
      const subdomain = ctx.subdomain;
      _authProvidersLocales[subdomain] = {};
    }

    // inner methods

    _prepareModules() {
      const modules = {};
      for (const relativeName in ctx.app.meta.modules) {
        const module = ctx.app.meta.modules[relativeName];
        const _module = {
          name: relativeName,
          title: module.package.title || module.info.name,
          description: ctx.text(module.package.description),
          info: module.info,
        };
        _module.titleLocale = ctx.text(_module.title);
        modules[relativeName] = _module;
      }
      return modules;
    }

    _prepareThemes() {
      const modules = {};
      for (const relativeName in ctx.app.meta.modules) {
        const module = ctx.app.meta.modules[relativeName];
        if (module.package.eggBornModule && module.package.eggBornModule.theme) {
          const _module = {
            name: relativeName,
            title: module.package.title || module.info.name,
            description: ctx.text(module.package.description),
            info: module.info,
          };
          _module.titleLocale = ctx.text(_module.title);
          modules[relativeName] = _module;
        }
      }
      return modules;
    }

    _prepareLocales() {
      const locales = [];
      const config = ctx.config.module(moduleInfo.relativeName);
      for (const locale in config.locales) {
        locales.push({
          title: ctx.text(config.locales[locale]),
          value: locale,
        });
      }
      return locales;
    }

    _prepareLocaleModules() {
      const localeModules = [];
      for (const module of ctx.app.meta.modulesArray) {
        const locale = module.package.eggBornModule && module.package.eggBornModule.locale;
        if (!locale) continue;
        const locales = locale.split(',');
        if (locales.findIndex(item => item === ctx.locale) > -1) {
          localeModules.push(module.info.relativeName);
        }
      }
      return localeModules;
    }

    _prepareResourceTypes() {
      const resourceTypes = {};
      for (const module of ctx.app.meta.modulesArray) {
        const moduleName = module.info.relativeName;
        const resources = module.main.meta && module.main.meta.base && module.main.meta.base.resources;
        if (!resources) continue;
        for (const key in resources) {
          const resource = resources[key];
          const fullKey = `${moduleName}:${key}`;
          resourceTypes[fullKey] = {
            ...resource,
            titleLocale: ctx.text(resource.title),
          };
        }
      }
      return resourceTypes;
    }

    _prepareAtomClasses() {
      const atomClasses = {};
      for (const relativeName in ctx.app.meta.modules) {
        const module = ctx.app.meta.modules[relativeName];
        if (module.main.meta && module.main.meta.base && module.main.meta.base.atoms) {
          const res = this._prepareAtomClassesModule(module, module.main.meta.base.atoms);
          if (Object.keys(res).length > 0) {
            atomClasses[relativeName] = res;
          }
        }
      }
      return atomClasses;
    }

    _prepareAtomClassesModule(module, _atoms) {
      const atomClasses = {};
      for (const key in _atoms) {
        // info
        const atomClass = {
          name: key,
          ..._atoms[key].info,
        };
        // titleLocale
        atomClass.titleLocale = ctx.text(atomClass.title);
        // ok
        atomClasses[key] = atomClass;
      }
      return atomClasses;
    }

    _prepareActions() {
      const actions = {};
      for (const relativeName in ctx.app.meta.modules) {
        const module = ctx.app.meta.modules[relativeName];
        if (module.main.meta && module.main.meta.base && module.main.meta.base.atoms) {
          const res = {};
          for (const atomClassName in module.main.meta.base.atoms) {
            const res2 = this._prepareActionsAtomClass(module, module.main.meta.base.atoms[atomClassName]);
            if (Object.keys(res2).length > 0) {
              res[atomClassName] = res2;
            }
          }
          if (Object.keys(res).length > 0) {
            actions[relativeName] = res;
          }
        }
      }
      return actions;
    }

    _prepareActionsAtomClass(module, atomClass) {
      const actions = {};
      const _actions = atomClass.actions;
      const _actionsSystem = ctx.constant.module(moduleInfo.relativeName).atom.action;
      const _actionsSystemMeta = ctx.constant.module(moduleInfo.relativeName).atom.actionMeta;
      const _actionsAll = extend(true, {}, _actionsSystemMeta, _actions);
      for (const key in _actionsAll) {
        if (key === 'custom') continue;
        const action = _actionsAll[key];
        if (!action.code) action.code = _actionsSystem[key];
        action.name = key;
        action.titleLocale = ctx.text(action.title);
        actions[key] = action;
      }
      return actions;
    }

    _prepareAuthProviders() {
      const authProviders = {};
      for (const relativeName in ctx.app.meta.modules) {
        const module = ctx.app.meta.modules[relativeName];
        let metaAuth = module.main.meta && module.main.meta.auth;
        if (!metaAuth) continue;
        if (typeof metaAuth === 'function') {
          metaAuth = metaAuth(ctx);
        }
        if (!metaAuth.providers) continue;
        // loop
        for (const providerName in metaAuth.providers) {
          const _authProvider = metaAuth.providers[providerName];
          if (!_authProvider) continue;
          const authProvider = {
            meta: { ..._authProvider.meta }, // for titleLocale separately
            config: _authProvider.config,
            configFunctions: _authProvider.configFunctions,
            handler: _authProvider.handler,
          };
          if (authProvider.meta && authProvider.meta.title) {
            authProvider.meta.titleLocale = ctx.text(authProvider.meta.title);
          }
          authProviders[`${relativeName}:${providerName}`] = authProvider;
        }
      }
      return authProviders;
    }

  }

  return Base;
};
