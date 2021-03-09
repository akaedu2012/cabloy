/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 616:
/***/ ((module) => {

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Worker extends app.meta.BeanBase {

    get id() {
      return app.meta.workerId;
    }

    async setAlive() {
      const config = app.meta.configs[moduleInfo.relativeName];
      const aliveTimeout = config.worker.alive.timeout;
      const key = `workerAlive:${this.id}`;
      const redis = app.redis.get('cache');
      await redis.set(key, JSON.stringify(true), 'PX', aliveTimeout * 2);
    }

    async getAlive({ id }) {
      const key = `workerAlive:${id}`;
      const redis = app.redis.get('cache');
      const value = await redis.get(key);
      return value ? JSON.parse(value) : undefined;
    }

  }

  return Worker;
};


/***/ }),

/***/ 456:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const require3 = __webpack_require__(718);
const moment = require3('moment');
const chalk = require3('chalk');

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Version extends app.meta.BeanBase {

    async databaseInitStartup() {
      // database
      await this.__database();
      // version start
      await this.__start();
    }

    async databaseNameStartup() {
      // database
      await this.__database();
    }

    async instanceInitStartup({ options }) {
      const instanceBase = options && options.instanceBase;
      await this.__instanceInit(this.ctx.subdomain, instanceBase);
    }

    async __start() {
      // update all modules
      try {
        const result = await this.__check({ scene: null });
        if (Object.keys(result).length > 0) console.log(result);
        console.log(chalk.cyan('  All modules are checked successfully!'));
      } catch (err) {
        console.log(chalk.cyan('  Modules are checked failed!'));
        throw err;
      }
    }

    async __instanceInit(subdomain, instanceBase) {
      try {
        if (!instanceBase) {
          instanceBase = this.ctx.bean.instance._getInstanceBase({ subdomain });
        }
        if (!instanceBase) instanceBase = {};
        await this.__check({ ...instanceBase, scene: 'init', subdomain });
        console.log(chalk.cyan(`  The instance is initialized successfully: ${subdomain || 'default'}`));
      } catch (err) {
        console.log(chalk.cyan(`  The instance is initialized failed: ${subdomain || 'default'}`));
        throw err;
      }
    }

    async __instanceTest(subdomain) {
      await this.__check({ scene: 'test', subdomain });
    }

    // scene: null/init/test
    async __check(options) {
      options.result = {};

      if (!options.scene) {
        // confirm table aVersion exists
        const res = await this.ctx.db.queryOne('show tables like \'aVersion\'');
        if (!res) {
          await this.ctx.db.query(`
          CREATE TABLE aVersion (
            id INT NOT NULL AUTO_INCREMENT,
            module VARCHAR(50) NULL,
            version INT NULL,
            createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id));
          `);
        }
      }

      // check all modules
      for (const module of app.meta.modulesArray) {
        await this.__checkModule(module.info.relativeName, options);
      }

      // check if role dirty for init/test
      if (options.scene === 'init' || options.scene === 'test') {
        await this.ctx.executeBean({
          subdomain: options.subdomain,
          beanModule: moduleInfo.relativeName,
          beanFullName: `${moduleInfo.relativeName}.local.version`,
          fn: '__after',
        });
      }

      // ok
      return options.result;
    }

    // check module
    async __checkModule(moduleName, options) {

      // module
      const module = this.__getModule(moduleName);

      // fileVersionNew
      let fileVersionNew = 0;
      if (module.package.eggBornModule && module.package.eggBornModule.fileVersion) {
        fileVersionNew = module.package.eggBornModule.fileVersion;
      }

      if (fileVersionNew && (!options.scene || options.scene === 'init')) {
        // update module or init module

        // -1: always
        if (fileVersionNew === -1) {
          await this.__updateModule(options, module, -1, -1);
        } else {
          // fileVersionOld
          let fileVersionOld = 0; // default
          if (!options.scene) {
            const res = await this.ctx.db.queryOne('select * from aVersion where module=? order by version desc', [ moduleName ]);
            if (res) {
              fileVersionOld = res.version;
            }
          } else {
            const res = await this.ctx.db.queryOne('select * from aVersionInit where subdomain=? and module=? order by version desc', [ options.subdomain, moduleName ]);
            if (res) {
              fileVersionOld = res.version;
            }
          }

          // check if need update
          if (fileVersionOld > fileVersionNew) {
            this.ctx.throw(1001, moduleName);
          } else if (fileVersionOld < fileVersionNew) {
            await this.__updateModule(options, module, fileVersionOld, fileVersionNew);
          }
        }

      }

      if (options.scene === 'test') {
        // test module
        await this.ctx.executeBean({
          subdomain: options.subdomain,
          beanModule: module.info.relativeName,
          transaction: true,
          fn: async ({ ctx }) => {
            await this.__testModuleTransaction(ctx, module, fileVersionNew, options);
          },
        });
      }

    }

    // update module or init module
    async __updateModule(options, module, fileVersionOld, fileVersionNew) {

      if (fileVersionNew === -1) {
        // always
        await this.__updateModule2(options, module, -1);
      } else {
        // versions
        const versions = [];
        for (let version = fileVersionOld + 1; version <= fileVersionNew; version++) {
          versions.push(version);
        }

        // loop
        for (const version of versions) {
          await this.__updateModule2(options, module, version);
        }
      }

      // log
      options.result[module.info.relativeName] = { fileVersionOld, fileVersionNew };

    }

    async __updateModule2(options, module, version) {
      // perform action
      try {
        if (!options.scene) {
          // update
          await this.ctx.executeBean({
            beanModule: module.info.relativeName,
            transaction: true,
            fn: async ({ ctx }) => {
              await this.__updateModuleTransaction(ctx, module, version);
            },
          });
        } else {
          // init
          await this.ctx.executeBean({
            subdomain: options.subdomain,
            beanModule: module.info.relativeName,
            transaction: true,
            fn: async ({ ctx }) => {
              await this.__initModuleTransaction(ctx, module, version, options);
            },
          });
        }
      } catch (err) {
        throw err;
      }
    }

    async __updateModuleTransaction(_ctx, module, version) {
      // bean
      const beanVersion = _ctx.bean._getBean(`${module.info.relativeName}.version.manager`);
      if (!beanVersion) throw new Error(`version.manager not exists for ${module.info.relativeName}`);
      if (!beanVersion.update) throw new Error(`version.manager.update not exists for ${module.info.relativeName}`);
      // execute
      await beanVersion.update({ version });
      // insert record
      if (version > 0) {
        await _ctx.db.insert('aVersion', {
          module: module.info.relativeName,
          version,
        });
      }
    }

    async __initModuleTransaction(_ctx, module, version, options) {
      // bean
      const beanVersion = _ctx.bean._getBean(`${module.info.relativeName}.version.manager`);
      if (!beanVersion) throw new Error(`version.manager not exists for ${module.info.relativeName}`);
      // execute
      if (beanVersion.init) {
        await beanVersion.init({ ...options, version });
      }
      // insert record
      if (version > 0) {
        await _ctx.db.insert('aVersionInit', {
          subdomain: options.subdomain,
          module: module.info.relativeName,
          version,
        });
      }
    }

    // test module
    async __testModuleTransaction(_ctx, module, version, options) {
      // bean
      const beanVersion = _ctx.bean._getBean(`${module.info.relativeName}.version.manager`);
      // execute
      if (beanVersion && beanVersion.test) {
        await beanVersion.test({ ...options, version });
      }
    }

    async __after() {
      const dirty = await this.ctx.bean.role.getDirty();
      if (dirty) {
        await this.ctx.bean.role.build();
      }
    }

    async __database() {
      // db prefix
      const dbPrefix = `egg-born-test-${app.name}`;
      // dev/debug db
      if (app.meta.isLocal) {
        const mysqlConfig = app.config.mysql.clients.__ebdb;
        if ((mysqlConfig.database === 'sys' || mysqlConfig.database === 'mysql') && !app.mysql.__ebdb_test) {
          let databaseName;
          const mysql = app.mysql.get('__ebdb');
          const dbs = await mysql.query(`show databases like \'${dbPrefix}-%\'`);
          if (dbs.length === 0) {
            databaseName = `${dbPrefix}-${moment().format('YYYYMMDD-HHmmss')}`;
            await mysql.query(`CREATE DATABASE \`${databaseName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
          } else {
            const db = dbs[0];
            databaseName = db[Object.keys(db)[0]];
          }
          // create test mysql
          mysqlConfig.database = databaseName;
          app.mysql.__ebdb_test = app.mysql.createInstance(mysqlConfig);// database ready
          this.ctx.db = null; // reset
          console.log(chalk.cyan(`  database: ${mysqlConfig.database}, pid: ${process.pid}`));
        }
      }
      // test db
      if (app.meta.isTest && !app.mysql.__ebdb_test) {
        // drop old databases
        const mysql = app.mysql.get('__ebdb');
        const dbs = await mysql.query(`show databases like \'${dbPrefix}-%\'`);
        for (const db of dbs) {
          const name = db[Object.keys(db)[0]];
          await mysql.query(`drop database \`${name}\``);
        }
        // create database
        const databaseName = `${dbPrefix}-${moment().format('YYYYMMDD-HHmmss')}`;
        await mysql.query(`CREATE DATABASE \`${databaseName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
        // create test mysql
        const mysqlConfig = app.config.mysql.clients.__ebdb;
        mysqlConfig.database = databaseName;
        app.mysql.__ebdb_test = app.mysql.createInstance(mysqlConfig);
        this.ctx.db = null; // reset
        // database ready
        console.log(chalk.cyan(`  database: ${mysqlConfig.database}, pid: ${process.pid}`));
      }
    }

    // get module
    __getModule(moduleName) {
      return app.meta.modules[moduleName];
    }

  }

  return Version;
};


/***/ }),

/***/ 794:
/***/ ((module) => {

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Startup extends app.meta.BeanBase {

    async execute() {
      const bean = this.ctx.bean._getBean(`${moduleInfo.relativeName}.local.version`);
      return await bean.databaseInitStartup();
    }

  }

  return Startup;
};


/***/ }),

/***/ 88:
/***/ ((module) => {

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Startup extends app.meta.BeanBase {

    async execute() {
      const bean = this.ctx.bean._getBean(`${moduleInfo.relativeName}.local.version`);
      return await bean.databaseNameStartup();
    }

  }

  return Startup;
};


/***/ }),

/***/ 598:
/***/ ((module) => {

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Startup extends app.meta.BeanBase {

    async execute(context) {
      const options = context.options;
      const bean = this.ctx.bean._getBean(`${moduleInfo.relativeName}.local.version`);
      return await bean.instanceInitStartup({ options });
    }

  }

  return Startup;
};


/***/ }),

/***/ 127:
/***/ ((module) => {

module.exports = app => {
  class Startup extends app.meta.BeanBase {

    async execute() {
      const aliveTimeout = this.ctx.config.worker.alive.timeout;
      // interval
      setInterval(async () => {
        await app.bean.worker.setAlive();
      }, aliveTimeout);
      // alive
      await app.bean.worker.setAlive();
    }

  }

  return Startup;
};


/***/ }),

/***/ 899:
/***/ ((module) => {

module.exports = app => {
  class Version extends app.meta.BeanBase {

    async update(options) {
      if (options.version === 1) {
        // do nothing
      }

      if (options.version === 2) {
        await this.ctx.db.query(`
          CREATE TABLE aVersionInit (
            id INT NOT NULL AUTO_INCREMENT,
            subdomain VARCHAR(50) NULL,
            module VARCHAR(50) NULL,
            version INT NULL,
            createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id));
          `);
      }
    }

  }

  return Version;
};


/***/ }),

/***/ 187:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const versionManager = __webpack_require__(899);
const localVersion = __webpack_require__(456);
const startupWorkerAlive = __webpack_require__(127);
const startupDatabaseInit = __webpack_require__(794);
const startupDatabaseName = __webpack_require__(88);
const startupInstanceInit = __webpack_require__(598);
const beanWorker = __webpack_require__(616);

module.exports = app => {
  const beans = {
    // version
    'version.manager': {
      mode: 'app',
      bean: versionManager,
    },
    // local
    'local.version': {
      mode: 'app',
      bean: localVersion,
    },
    // startup
    'startup.workerAlive': {
      mode: 'app',
      bean: startupWorkerAlive,
    },
    'startup.databaseInit': {
      mode: 'app',
      bean: startupDatabaseInit,
    },
    'startup.databaseName': {
      mode: 'app',
      bean: startupDatabaseName,
    },
    'startup.instanceInit': {
      mode: 'app',
      bean: startupInstanceInit,
    },
    // global
    worker: {
      mode: 'app',
      bean: beanWorker,
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

  // startups
  config.startups = {
    workerAlive: {
      bean: 'workerAlive',
    },
    databaseInit: {
      bean: 'databaseInit',
      debounce: true,
    },
    databaseName: {
      bean: 'databaseName',
    },
    instanceInit: {
      bean: 'instanceInit',
      instance: true,
      debounce: true,
    },
  };

  // worker
  config.worker = {
    alive: {
      timeout: 6000,
    },
  };

  return config;
};


/***/ }),

/***/ 479:
/***/ ((module) => {

module.exports = {
};


/***/ }),

/***/ 624:
/***/ ((module) => {

module.exports = {
  1001: 'Module %s is Old',
};


/***/ }),

/***/ 72:
/***/ ((module) => {

module.exports = {
  'Module %s is Old': '模块过旧',
};


/***/ }),

/***/ 25:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = {
  'zh-cn': __webpack_require__(72),
};


/***/ }),

/***/ 95:
/***/ ((module) => {

module.exports = app => {
  const controllers = {
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
const constants = __webpack_require__(479);

// eslint-disable-next-line
module.exports = app => {

  // beans
  const beans = __webpack_require__(187)(app);
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
    constants,
  };

};


/***/ }),

/***/ 825:
/***/ ((module) => {

module.exports = [
];


/***/ }),

/***/ 214:
/***/ ((module) => {

module.exports = {
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