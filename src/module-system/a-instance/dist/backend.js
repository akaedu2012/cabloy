/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 755:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const require3 = __webpack_require__(718);
const extend = require3('extend2');
const async = require3('async');

const __queueInstanceStartup = {};

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Instance {

    async list(options) {
      // options
      if (!options) options = { where: null, orders: null, page: null };
      const page = ctx.bean.util.page(options.page, false);
      const orders = options.orders;
      const where = options.where || { disabled: 0 };// allow disabled=undefined
      // select
      const _options = { where, orders };
      if (page.size !== 0) {
        _options.limit = page.size;
        _options.offset = page.index;
      }
      const modelInstance = ctx.model.module(moduleInfo.relativeName).instance;
      return await modelInstance.select(_options);
    }

    async get({ subdomain }) {
      // cache
      const cacheMem = ctx.cache.mem.module(moduleInfo.relativeName);
      const instance = cacheMem.get('instance');
      if (instance) return instance;
      return await this.resetCache({ subdomain });
    }

    async _get({ subdomain }) {
      // get
      const modelInstance = ctx.model.module(moduleInfo.relativeName).instance;
      const instance = await modelInstance.get({ name: subdomain });
      if (instance) return instance;
      // instance base
      const instanceBase = this._getInstanceBase({ subdomain });
      if (!instanceBase) return null;
      // lock
      return await ctx.app.meta.util.lock({
        resource: `${moduleInfo.relativeName}.registerInstance.${subdomain}`,
        fn: async () => {
          return await ctx.app.meta.util.executeBean({
            beanModule: moduleInfo.relativeName,
            beanFullName: 'instance',
            context: { instanceBase },
            fn: '_registerLock',
          });
        },
      });
    }

    async _registerLock({ instanceBase }) {
      // get again
      const modelInstance = ctx.model.module(moduleInfo.relativeName).instance;
      let instance = await modelInstance.get({ name: instanceBase.subdomain });
      if (instance) return instance;
      // insert
      instance = {
        name: instanceBase.subdomain,
        title: instanceBase.title,
        config: JSON.stringify(instanceBase.config || {}),
        disabled: 0,
      };
      const res = await modelInstance.insert(instance);
      instance.id = res.insertId;
      return instance;
    }

    _getInstanceBase({ subdomain }) {
      const instances = ctx.app.config.instances || [{ subdomain: '', password: '' }];
      return instances.find(item => item.subdomain === subdomain);
    }

    async resetCache({ subdomain }) {
      // cache
      const cacheMem = ctx.cache.mem.module(moduleInfo.relativeName);
      const instance = await this._get({ subdomain });
      if (!instance) return null;
      // config
      instance.config = JSON.parse(instance.config) || {};
      // cache configs
      const instanceConfigs = extend(true, {}, ctx.app.meta.configs, instance.config);
      cacheMem.set('instanceConfigs', instanceConfigs);
      // cache configsFront
      const instanceConfigsFront = this._mergeInstanceConfigFront({ instanceConfigs });
      cacheMem.set('instanceConfigsFront', instanceConfigsFront);
      // cache instance
      cacheMem.set('instance', instance);
      return instance;
    }

    getInstanceConfigs() {
      const cacheMem = ctx.cache.mem.module(moduleInfo.relativeName);
      return cacheMem.get('instanceConfigs');
    }

    getInstanceConfigsFront() {
      const cacheMem = ctx.cache.mem.module(moduleInfo.relativeName);
      return cacheMem.get('instanceConfigsFront');
    }

    _mergeInstanceConfigFront({ instanceConfigs }) {
      const instanceConfigsFront = {};
      for (const moduleName in instanceConfigs) {
        const instanceConfig = instanceConfigs[moduleName];
        if (instanceConfig.configFront) {
          instanceConfigsFront[moduleName] = instanceConfig.configFront;
        }
      }
      return instanceConfigsFront;
    }

    async checkAppReady(options) {
      if (!options) options = { wait: true };
      if (!ctx.app.meta.appReady && options.wait === false) return false;
      while (!ctx.app.meta.appReady) {
        await ctx.bean.util.sleep(300);
      }
      return true;
    }

    async checkAppReadyInstance(options) {
      if (!options) options = { startup: true };
      // chech appReady first
      const appReady = await ctx.bean.instance.checkAppReady({ wait: options.startup !== false });
      if (!appReady) return false;
      // check appReady instance
      const subdomain = ctx.subdomain;
      if (subdomain === undefined) throw new Error(`subdomain not valid: ${subdomain}`);
      if (ctx.app.meta.appReadyInstances[subdomain]) return true;
      // instance startup
      if (options.startup === false) return false;
      await this.instanceStartup({ subdomain });
      return true;
    }

    // options: force/instanceBase
    async instanceStartup({ subdomain, options }) {
      // queue within the same worker
      if (!__queueInstanceStartup[subdomain]) {
        __queueInstanceStartup[subdomain] = async.queue((info, cb) => {
          // check again
          const force = info.options && info.options.force;
          if (ctx.app.meta.appReadyInstances[info.subdomain] && !force) {
            info.resolve();
            cb();
            return;
          }
          // startup
          ctx.app.meta._runStartupInstance({ subdomain: info.subdomain, options: info.options }).then(() => {
            info.resolve();
            cb();
          }).catch(err => {
            info.reject(err);
            cb();
          });
        });
      }
      // promise
      return new Promise((resolve, reject) => {
        // options
        if (!options) options = { force: false, instanceBase: null };
        // queue push
        __queueInstanceStartup[subdomain].push({ resolve, reject, subdomain, options });
      });
    }

  }
  return Instance;
};


/***/ }),

/***/ 875:
/***/ ((module) => {

module.exports = app => {
  class Broadcast extends app.meta.BeanBase {

    async execute() {
      await this.ctx.bean.instance.instanceStartup({
        subdomain: this.ctx.subdomain,
        options: {
          force: true, instanceBase: null,
        },
      });
    }

  }

  return Broadcast;
};


/***/ }),

/***/ 160:
/***/ ((module) => {

module.exports = app => {
  class Broadcast extends app.meta.BeanBase {

    async execute() {
      await this.ctx.bean.instance.resetCache({ subdomain: this.ctx.subdomain });
    }

  }

  return Broadcast;
};


/***/ }),

/***/ 714:
/***/ ((module) => {

// MaxListenersExceededWarning
// const eventAppReady = 'eb:event:appReady';

// function checkAppReady(app) {
//   return new Promise(resolve => {
//     app.once(eventAppReady, () => {
//       resolve();
//     });
//   });
// }

module.exports = ctx => {
  class Middleware {
    async execute(options, next) {
      // check appReady
      if (!ctx.innerAccess) {
        await ctx.bean.instance.checkAppReady();
      }
      // next
      await next();
    }
  }
  return Middleware;
};


/***/ }),

/***/ 122:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const require3 = __webpack_require__(718);
const chalk = require3('chalk');
const boxen = require3('boxen');

const boxenOptions = { padding: 1, margin: 1, align: 'center', borderColor: 'yellow', borderStyle: 'round' };

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Middleware {
    async execute(options, next) {
      // instance
      const instance = await ctx.bean.instance.get({ subdomain: ctx.subdomain });
      if (!instance) {
        // prompt
        if (ctx.app.meta.isLocal) {
          const urlInfo = ctx.locale === 'zh-cn' ? 'https://cabloy.com/zh-cn/articles/multi-instance.html' : 'https://cabloy.com/articles/multi-instance.html';
          let message = `Please add instance in ${chalk.keyword('cyan')('src/backend/config/config.local.js')}`;
          message += '\n' + chalk.keyword('orange')(`{ subdomain: '${ctx.subdomain}', password: '', title: '' }`);
          message += `\nMore info: ${chalk.keyword('cyan')(urlInfo)}`;
          console.log('\n' + boxen(message, boxenOptions));
        }
        return ctx.throw(423);
      }
      // check if disabled
      if (instance.disabled) {
        // locked
        return ctx.throw(423);
      }

      // check instance startup ready
      await ctx.bean.instance.checkAppReadyInstance();

      // try to save host/protocol to config
      if (ctxHostValid(ctx)) {
        if (!instance.config['a-base']) instance.config['a-base'] = {};
        const aBase = instance.config['a-base'];
        if (aBase.host !== ctx.host || aBase.protocol !== ctx.protocol) {
          aBase.host = ctx.host;
          aBase.protocol = ctx.protocol;
          // update
          const modelInstance = ctx.model.module(moduleInfo.relativeName).instance;
          await modelInstance.update({
            id: instance.id,
            config: JSON.stringify(instance.config) });
          // broadcast
          ctx.app.meta.broadcast.emit({
            subdomain: ctx.subdomain,
            module: 'a-instance',
            broadcastName: 'resetCache',
            data: null,
          });
        }
      }

      // ok
      ctx.instance = instance;

      // next
      await next();
    }
  }
  return Middleware;
};

function ctxHostValid(ctx) {
  return !ctx.innerAccess && ctx.host && ctx.protocol && ctx.host !== '127.0.0.1' && ctx.host !== 'localhost';
}


/***/ }),

/***/ 899:
/***/ ((module) => {

module.exports = app => {

  class Version extends app.meta.BeanBase {

    async update(options) {
      if (options.version === 1) {
        // create table: aInstance
        const sql = `
          CREATE TABLE aInstance (
            id int(11) NOT NULL AUTO_INCREMENT,
            createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted int(11) DEFAULT '0',
            disabled int(11) DEFAULT '0',
            name varchar(255) DEFAULT NULL,
            PRIMARY KEY (id)
          )
        `;
        await this.ctx.db.query(sql);
      }
      if (options.version === 2) {
        // aInstance
        const sql = `
          ALTER TABLE aInstance
          ADD COLUMN title varchar(255) DEFAULT NULL
        `;
        await this.ctx.model.query(sql);
      }
      if (options.version === 3) {
        // aInstance
        const sql = `
          ALTER TABLE aInstance
          ADD COLUMN meta json DEFAULT NULL
        `;
        await this.ctx.model.query(sql);
      }
      if (options.version === 4) {
        // aInstance
        const sql = `
          ALTER TABLE aInstance
          CHANGE COLUMN meta config json DEFAULT NULL
        `;
        await this.ctx.model.query(sql);
      }
    }

    async init(options) { }

  }

  return Version;
};


/***/ }),

/***/ 187:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const versionManager = __webpack_require__(899);
const beanInstance = __webpack_require__(755);
const broadcastResetCache = __webpack_require__(160);
const broadcastReload = __webpack_require__(875);
const middlewareAppReady = __webpack_require__(714);
const middlewareInstance = __webpack_require__(122);

module.exports = app => {
  const beans = {
    // version
    'version.manager': {
      mode: 'app',
      bean: versionManager,
    },
    // broadcast
    'broadcast.resetCache': {
      mode: 'app',
      bean: broadcastResetCache,
    },
    'broadcast.reload': {
      mode: 'app',
      bean: broadcastReload,
    },
    // middleware
    'middleware.appReady': {
      mode: 'ctx',
      bean: middlewareAppReady,
    },
    'middleware.instance': {
      mode: 'ctx',
      bean: middlewareInstance,
    },
    // global
    instance: {
      mode: 'ctx',
      bean: beanInstance,
      global: true,
    },
  };
  return beans;
};


/***/ }),

/***/ 76:
/***/ ((module) => {

// eslint-disable-next-line
module.exports = appInfo => {
  const config = {};

  // middlewares
  config.middlewares = {
    instance: {
      bean: 'instance',
      global: true,
      dependencies: 'appReady',
    },
    appReady: {
      bean: 'appReady',
      global: true,
    },
  };

  // broadcasts
  config.broadcasts = {
    resetCache: {
      bean: 'resetCache',
    },
    reload: {
      bean: 'reload',
    },
  };

  return config;
};


/***/ }),

/***/ 624:
/***/ ((module) => {

// error code should start from 1001
module.exports = {
};


/***/ }),

/***/ 72:
/***/ ((module) => {

module.exports = {
  Instance: '实例',
};


/***/ }),

/***/ 25:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = {
  'zh-cn': __webpack_require__(72),
};


/***/ }),

/***/ 232:
/***/ ((module) => {

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const schemas = {};
  // instance
  schemas.instance = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Subdomain',
        ebReadOnly: true,
      },
      title: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Title',
      },
      config: {
        type: 'string',
        ebType: 'json',
        ebTitle: 'Config',
        ebParams: {
          target: '',
          immediate: true,
          actions: [{
            name: 'preview',
            actionModule: moduleInfo.relativeName,
            actionComponent: 'action',
            icon: { material: 'visibility' },
            navigateOptions: { target: '_self' },
          }],
        },
        // notEmpty: true,
      },
    },
  };

  return schemas;
};


/***/ }),

/***/ 731:
/***/ ((module) => {

module.exports = app => {
  class InstanceController extends app.Controller {

    async item() {
      const res = await this.service.instance.item();
      this.ctx.success(res);
    }

    async save() {
      await this.service.instance.save({
        data: this.ctx.request.body.data,
      });
      this.ctx.success();
    }

    async getConfigsPreview() {
      const res = await this.service.instance.getConfigsPreview();
      this.ctx.success(res);
    }

    async reload() {
      await this.service.instance.reload();
      this.ctx.success();
    }

  }
  return InstanceController;
};


/***/ }),

/***/ 95:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const instance = __webpack_require__(731);

module.exports = app => {
  const controllers = {
    instance,
  };
  return controllers;
};


/***/ }),

/***/ 421:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const routes = __webpack_require__(825);
const services = __webpack_require__(214);
const config = __webpack_require__(76);
const locales = __webpack_require__(25);
const errors = __webpack_require__(624);

// eslint-disable-next-line
module.exports = app => {

  // beans
  const beans = __webpack_require__(187)(app);
  // models
  const models = __webpack_require__(230)(app);
  // meta
  const meta = __webpack_require__(458)(app);
  // controllers
  const controllers = __webpack_require__(95)(app);

  return {
    beans,
    routes,
    controllers,
    services,
    config,
    locales,
    errors,
    models,
    meta,
  };

};


/***/ }),

/***/ 458:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = app => {
  const schemas = __webpack_require__(232)(app);
  const meta = {
    validation: {
      validators: {
        instance: {
          schemas: 'instance',
        },
      },
      keywords: {},
      schemas: {
        instance: schemas.instance,
      },
    },
    settings: {
      instance: {
        actionPath: 'instance/config',
      },
    },
  };
  return meta;
};


/***/ }),

/***/ 373:
/***/ ((module) => {

module.exports = app => {
  class Instance extends app.meta.Model {
    constructor(ctx) {
      super(ctx, { table: 'aInstance', options: { disableDeleted: false, disableInstance: true } });
    }
  }
  return Instance;
};


/***/ }),

/***/ 230:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const instance = __webpack_require__(373);

module.exports = app => {
  const models = {
    instance,
  };
  return models;
};


/***/ }),

/***/ 825:
/***/ ((module) => {

module.exports = [
  // instance
  { method: 'post', path: 'instance/item', controller: 'instance', meta: { right: { type: 'resource', module: 'a-settings', name: 'settings' } } },
  { method: 'post', path: 'instance/save', controller: 'instance', middlewares: 'validate',
    meta: {
      validate: { validator: 'instance' },
      right: { type: 'resource', module: 'a-settings', name: 'settings' },
    },
  },
  { method: 'post', path: 'instance/getConfigsPreview', controller: 'instance', meta: { right: { type: 'resource', module: 'a-settings', name: 'settings' } } },
  { method: 'post', path: 'instance/reload', controller: 'instance', meta: { right: { type: 'resource', module: 'a-settings', name: 'settings' } } },
];


/***/ }),

/***/ 878:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const require3 = __webpack_require__(718);
const extend = require3('extend2');

const __blackFields = [ 'startups', 'queues', 'broadcasts', 'middlewares', 'schedules' ];

module.exports = app => {

  class Instance extends app.Service {

    async item() {
      return await this.ctx.model.instance.get({ id: this.ctx.instance.id });
    }

    async save({ data }) {
      // update
      await this.ctx.model.instance.update({
        id: this.ctx.instance.id,
        title: data.title,
        config: JSON.stringify(this.__configBlackFields(data.config)),
      });
      // broadcast
      this.ctx.app.meta.broadcast.emit({
        subdomain: this.ctx.subdomain,
        module: 'a-instance',
        broadcastName: 'resetCache',
        data: null,
      });
    }

    async getConfigsPreview() {
      const instance = await this.item();
      let configPreview = extend(true, {}, app.meta.configs, JSON.parse(instance.config));
      configPreview = this.__configBlackFields(configPreview);
      return { data: configPreview };
    }

    async reload() {
      // broadcast
      this.ctx.app.meta.broadcast.emit({
        subdomain: this.ctx.subdomain,
        module: 'a-instance',
        broadcastName: 'reload',
        data: null,
      });
    }

    __configBlackFields(config) {
      if (typeof config === 'string') config = JSON.parse(config);
      for (const moduleName in config) {
        const moduleConfig = config[moduleName];
        for (const field of __blackFields) {
          delete moduleConfig[field];
        }
      }
      return config;
    }

  }

  return Instance;
};


/***/ }),

/***/ 214:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const instance = __webpack_require__(878);

module.exports = {
  instance,
};


/***/ }),

/***/ 718:
/***/ ((module) => {

"use strict";
module.exports = require("require3");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(421);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=backend.js.map