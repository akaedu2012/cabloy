/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 76:
/***/ ((module) => {

// eslint-disable-next-line
module.exports = appInfo => {
  const config = {};

  // providers
  config.providers = [
    {
      module: 'a-authsimple',
      provider: 'authsimple',
    },
    {
      module: 'a-authsms',
      provider: 'authsms',
    },
    {
      // disable: true,
      module: 'a-authgithub',
      provider: 'authgithub',
    },
  ];

  return config;
};


/***/ }),

/***/ 624:
/***/ ((module) => {

// error code should start from 1001
module.exports = {};


/***/ }),

/***/ 72:
/***/ ((module) => {

module.exports = {};


/***/ }),

/***/ 25:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = {
  'zh-cn': __webpack_require__(72),
};


/***/ }),

/***/ 523:
/***/ ((module) => {

module.exports = app => {
  class AuthController extends app.Controller {
    async list() {
      const res = await this.service.auth.list();
      this.ctx.success(res);
    }
  }
  return AuthController;
};


/***/ }),

/***/ 95:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const auth = __webpack_require__(523);

module.exports = app => {
  const controllers = {
    auth,
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
module.exports = (app, module) => {
  // controllers
  const controllers = __webpack_require__(95)(app);
  return {
    routes,
    controllers,
    services,
    config,
    locales,
    errors,
  };
};


/***/ }),

/***/ 825:
/***/ ((module) => {

module.exports = [
  // auth
  { method: 'post', path: 'auth/list', controller: 'auth' },
];


/***/ }),

/***/ 300:
/***/ ((module) => {

module.exports = app => {
  class Auth extends app.Service {
    async list() {
      // list
      const list = await this.ctx.model.query(
        `
        select a.id, a.module,a.providerName from aAuthProvider a
          where a.iid=? and a.disabled=0
        `,
        [this.ctx.instance.id]
      );
      // list map
      const listMap = {};
      // meta
      const authProviders = this.ctx.bean.base.authProviders();
      for (const item of list) {
        const key = `${item.module}:${item.providerName}`;
        const authProvider = authProviders[key];
        if (!authProvider) continue;
        item.meta = authProvider.meta;
        listMap[key] = item;
      }
      // order
      const res = [];
      for (const item of this.ctx.config.providers) {
        const key = `${item.module}:${item.provider}`;
        const provider = listMap[key];
        if (provider) {
          if (item.disable !== true) {
            res.push(provider);
          }
          delete listMap[key];
        }
      }
      // the rest
      for (const key in listMap) {
        res.push(listMap[key]);
      }
      // ok
      return res;
    }
  }

  return Auth;
};


/***/ }),

/***/ 214:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const auth = __webpack_require__(300);

module.exports = {
  auth,
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
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