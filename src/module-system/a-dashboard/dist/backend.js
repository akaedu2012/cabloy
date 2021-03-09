/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 730:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const require3 = __webpack_require__(718);
const uuid = require3('uuid');

module.exports = app => {

  class Atom extends app.meta.AtomBase {

    async create({ atomClass, item, user }) {
      // super
      const key = await super.create({ atomClass, item, user });
      // add dashboard
      const res = await this.ctx.model.dashboard.insert({
        atomId: key.atomId,
      });
      const itemId = res.insertId;
      // add content
      const content = {
        root: {
          id: uuid.v4().replace(/-/g, ''),
          widgets: [],
        },
      };
      await this.ctx.model.dashboardContent.insert({
        atomId: key.atomId,
        itemId,
        content: JSON.stringify(content),
      });
      return { atomId: key.atomId, itemId };
    }

    async read({ atomClass, options, key, user }) {
      // super
      const item = await super.read({ atomClass, options, key, user });
      if (!item) return null;
      // meta
      this._getMeta(item);
      // ok
      return item;
    }

    async select({ atomClass, options, items, user }) {
      // super
      await super.select({ atomClass, options, items, user });
      // meta
      for (const item of items) {
        this._getMeta(item);
      }
    }

    async write({ atomClass, target, key, item, options, user }) {
      // super
      await super.write({ atomClass, target, key, item, options, user });
      // update dashboard
      const data = await this.ctx.model.dashboard.prepareData(item);
      data.id = key.itemId;
      await this.ctx.model.dashboard.update(data);
      // update content
      await this.ctx.model.dashboardContent.update({
        content: item.content,
      }, { where: {
        atomId: key.atomId,
      } });
    }

    async delete({ atomClass, key, user }) {
      // delete dashboard
      await this.ctx.model.dashboard.delete({
        id: key.itemId,
      });
      // delete content
      await this.ctx.model.dashboardContent.delete({
        itemId: key.itemId,
      });
      // super
      await super.delete({ atomClass, key, user });
    }

    _getMeta(item) {
    }

  }

  return Atom;
};


/***/ }),

/***/ 899:
/***/ ((module) => {

module.exports = app => {

  class Version extends app.meta.BeanBase {

    async update(options) {
      if (options.version === 1) {
        // create table: aDashboardProfile
        const sql = `
          CREATE TABLE aDashboardProfile (
            id int(11) NOT NULL AUTO_INCREMENT,
            createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted int(11) DEFAULT '0',
            iid int(11) DEFAULT '0',
            userId int(11) DEFAULT '0',
            profileName varchar(255) DEFAULT NULL,
            profileValue json DEFAULT NULL,
            PRIMARY KEY (id)
          )
        `;
        await this.ctx.model.query(sql);
      }

      if (options.version === 2) {
        // drop table: aDashboardProfile
        let sql = `
          DROP TABLE aDashboardProfile
        `;
        await this.ctx.model.query(sql);

        // create table: aDashboard
        sql = `
          CREATE TABLE aDashboard (
            id int(11) NOT NULL AUTO_INCREMENT,
            createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted int(11) DEFAULT '0',
            iid int(11) DEFAULT '0',
            atomId int(11) DEFAULT '0',
            description varchar(255) DEFAULT NULL,
            PRIMARY KEY (id)
          )
          `;
        await this.ctx.model.query(sql);

        // create table: aDashboardContent
        sql = `
          CREATE TABLE aDashboardContent (
            id int(11) NOT NULL AUTO_INCREMENT,
            createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted int(11) DEFAULT '0',
            iid int(11) DEFAULT '0',
            atomId int(11) DEFAULT '0',
            itemId int(11) DEFAULT '0',
            content JSON DEFAULT NULL,
            PRIMARY KEY (id)
          )
        `;
        await this.ctx.model.query(sql);

        // create table: aDashboardUser
        sql = `
          CREATE TABLE aDashboardUser (
            id int(11) NOT NULL AUTO_INCREMENT,
            createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted int(11) DEFAULT '0',
            iid int(11) DEFAULT '0',
            userId int(11) DEFAULT '0',
            dashboardDefault int(11) DEFAULT '0',
            dashboardAtomId int(11) DEFAULT '0',
            dashboardName varchar(255) DEFAULT NULL,
            content JSON DEFAULT NULL,
            PRIMARY KEY (id)
          )
        `;
        await this.ctx.model.query(sql);

        // create view: aDashboardViewFull
        sql = `
          CREATE VIEW aDashboardViewFull as
            select a.*,b.content from aDashboard a
              left join aDashboardContent b on a.id=b.itemId
        `;
        await this.ctx.model.query(sql);

      }

    }

    async init(options) {
      if (options.version === 1) {}

      if (options.version === 2) {
        // add role rights
        const roleRights = [
          { roleName: 'system', action: 'create' },
          { roleName: 'system', action: 'read', scopeNames: 0 },
          { roleName: 'system', action: 'read', scopeNames: 'superuser' },
          { roleName: 'system', action: 'write', scopeNames: 0 },
          { roleName: 'system', action: 'write', scopeNames: 'superuser' },
          { roleName: 'system', action: 'delete', scopeNames: 0 },
          { roleName: 'system', action: 'delete', scopeNames: 'superuser' },
          { roleName: 'system', action: 'clone', scopeNames: 0 },
          { roleName: 'system', action: 'clone', scopeNames: 'superuser' },
          { roleName: 'system', action: 'authorize', scopeNames: 0 },
          { roleName: 'system', action: 'authorize', scopeNames: 'superuser' },
          { roleName: 'system', action: 'deleteBulk' },
          { roleName: 'system', action: 'exportBulk' },
        ];
        await this.ctx.bean.role.addRoleRightBatch({ atomClassName: 'dashboard', roleRights });
      }
    }

    async test() { }

  }

  return Version;
};


/***/ }),

/***/ 187:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const versionManager = __webpack_require__(899);
const atomDashboard = __webpack_require__(730);

module.exports = app => {
  const beans = {
    // version
    'version.manager': {
      mode: 'app',
      bean: versionManager,
    },
    // atom
    'atom.dashboard': {
      mode: 'app',
      bean: atomDashboard,
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
  return config;
};


/***/ }),

/***/ 624:
/***/ ((module) => {

// error code should start from 1001
module.exports = {
};


/***/ }),

/***/ 327:
/***/ ((module) => {

module.exports = {
  DashboardProfile: 'Dashboard Profile',
};


/***/ }),

/***/ 72:
/***/ ((module) => {

module.exports = {
  About: '关于',
  Dashboard: '仪表板',
  DashboardProfile: '仪表板配置',
  'Create Dashboard': '新建仪表板',
  'Dashboard List': '仪表板列表',
  'Dashboard Widget': '仪表板部件',
};


/***/ }),

/***/ 25:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = {
  'en-us': __webpack_require__(327),
  'zh-cn': __webpack_require__(72),
};


/***/ }),

/***/ 237:
/***/ ((module) => {

module.exports = app => {
  // const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const content = {
    root: {
      widgets: [
        {
          module: 'a-dashboard',
          name: 'widgetAbout',
        },
      ],
    },
  };
  const dashboard = {
    atomName: 'Default',
    atomStaticKey: 'dashboardDefault',
    atomRevision: 0,
    description: '',
    content: JSON.stringify(content),
    resourceRoles: 'root',
  };
  return dashboard;
};


/***/ }),

/***/ 224:
/***/ ((module) => {

module.exports = app => {
  // const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const content = {
    root: {
      widgets: [
        {
          module: 'a-dashboard',
          name: 'widgetAbout',
        },
      ],
    },
  };
  const dashboard = {
    atomName: 'Home',
    atomStaticKey: 'dashboardHome',
    atomRevision: 0,
    description: '',
    content: JSON.stringify(content),
    resourceRoles: 'root',
  };
  return dashboard;
};


/***/ }),

/***/ 937:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const dashboardDefault = __webpack_require__(237);
const dashboardHome = __webpack_require__(224);

module.exports = app => {
  const dashboards = [
    dashboardDefault(app),
    dashboardHome(app),
  ];
  return dashboards;
};


/***/ }),

/***/ 429:
/***/ ((module) => {

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const resources = [
    // menu
    {
      atomName: 'Create Dashboard',
      atomStaticKey: 'createDashboard',
      atomRevision: 0,
      atomCategoryId: 'a-base:menu.Create',
      resourceType: 'a-base:menu',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        atomClassName: 'dashboard',
        atomAction: 'create',
      }),
      resourceRoles: 'template.system',
    },
    {
      atomName: 'Dashboard List',
      atomStaticKey: 'listDashboard',
      atomRevision: 0,
      atomCategoryId: 'a-base:menu.List',
      resourceType: 'a-base:menu',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        atomClassName: 'dashboard',
        atomAction: 'read',
      }),
      resourceRoles: 'template.system',
    },
    // dashboard widget
    {
      atomName: 'About',
      atomStaticKey: 'widgetAbout',
      atomRevision: 0,
      atomCategoryId: 'a-dashboard:widget.General',
      resourceType: 'a-dashboard:widget',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        component: 'widgetAbout',
      }),
      resourceRoles: 'root',
    },
  ];
  return resources;
};


/***/ }),

/***/ 232:
/***/ ((module) => {

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const schemas = {};
  // dashboard
  schemas.dashboard = {
    type: 'object',
    properties: {
      atomName: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Name',
        notEmpty: true,
      },
      atomStaticKey: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'KeyForAtom',
        ebReadOnly: true,
        notEmpty: true,
      },
      description: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Description',
      },
      content: {
        type: 'string',
        ebType: 'component',
        ebTitle: 'Content',
        ebRender: {
          module: moduleInfo.relativeName,
          name: 'renderDashboardContent',
        },
        notEmpty: true,
      },
    },
  };
  // dashboard search
  schemas.dashboardSearch = {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Description',
      },
    },
  };
  return schemas;
};


/***/ }),

/***/ 157:
/***/ ((module) => {

module.exports = app => {
  class DashboardController extends app.Controller {

    async itemByKey() {
      const res = await this.service.dashboard.itemByKey({
        atomStaticKey: this.ctx.request.body.atomStaticKey,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async item() {
      const res = await this.service.dashboard.item({
        dashboardAtomId: this.ctx.request.body.key.atomId,
        dashboardUserCheck: this.ctx.request.body.dashboardUserCheck,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async loadItemUser() {
      const res = await this.service.dashboard.loadItemUser({
        dashboardUserId: this.ctx.request.body.dashboardUserId,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async saveItemUser() {
      const res = await this.service.dashboard.saveItemUser({
        dashboardUserId: this.ctx.request.body.dashboardUserId,
        content: this.ctx.request.body.content,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async changeItemUserName() {
      const res = await this.service.dashboard.changeItemUserName({
        dashboardUserId: this.ctx.request.body.dashboardUserId,
        dashboardName: this.ctx.request.body.dashboardName,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async deleteItemUser() {
      const res = await this.service.dashboard.deleteItemUser({
        dashboardUserId: this.ctx.request.body.dashboardUserId,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async createItemUser() {
      const res = await this.service.dashboard.createItemUser({
        dashboardAtomId: this.ctx.request.body.key.atomId,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async itemUsers() {
      const res = await this.service.dashboard.itemUsers({
        dashboardAtomId: this.ctx.request.body.key.atomId,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

    async changeItemUserDefault() {
      const res = await this.service.dashboard.changeItemUserDefault({
        dashboardAtomId: this.ctx.request.body.key.atomId,
        dashboardUserId: this.ctx.request.body.dashboardUserId,
        user: this.ctx.state.user.op,
      });
      this.ctx.success(res);
    }

  }
  return DashboardController;
};


/***/ }),

/***/ 95:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const dashboard = __webpack_require__(157);

module.exports = app => {
  const controllers = {
    dashboard,
  };
  return controllers;
};


/***/ }),

/***/ 421:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const config = __webpack_require__(76);
const locales = __webpack_require__(25);
const errors = __webpack_require__(624);

module.exports = app => {

  // beans
  const beans = __webpack_require__(187)(app);
  // routes
  const routes = __webpack_require__(825)(app);
  // controllers
  const controllers = __webpack_require__(95)(app);
  // services
  const services = __webpack_require__(214)(app);
  // models
  const models = __webpack_require__(230)(app);
  // meta
  const meta = __webpack_require__(458)(app);

  return {
    beans,
    routes,
    controllers,
    services,
    models,
    config,
    locales,
    errors,
    meta,
  };

};


/***/ }),

/***/ 458:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = app => {
  const schemas = __webpack_require__(232)(app);
  const staticDashboards = __webpack_require__(937)(app);
  const staticResources = __webpack_require__(429)(app);
  const meta = {
    base: {
      atoms: {
        dashboard: {
          info: {
            bean: 'dashboard',
            title: 'Dashboard',
            tableName: 'aDashboard',
            tableNameModes: {
              full: 'aDashboardViewFull',
            },
          },
          actions: {
            write: {
              enableOnStatic: true,
            },
          },
          validator: 'dashboard',
          search: {
            validator: 'dashboardSearch',
          },
        },
      },
      resources: {
        widget: {
          title: 'Dashboard Widget',
        },
      },
      statics: {
        'a-dashboard.dashboard': {
          items: staticDashboards,
        },
        'a-base.resource': {
          items: staticResources,
        },
      },
    },
    sequence: {
      providers: {
        dashboard: {
          bean: {
            module: 'a-sequence',
            name: 'simple',
          },
          start: 0,
        },
      },
    },
    validation: {
      validators: {
        dashboard: {
          schemas: 'dashboard',
        },
        dashboardSearch: {
          schemas: 'dashboardSearch',
        },
      },
      keywords: {},
      schemas: {
        dashboard: schemas.dashboard,
        dashboardSearch: schemas.dashboardSearch,
      },
    },
  };
  return meta;
};


/***/ }),

/***/ 456:
/***/ ((module) => {

module.exports = app => {
  class Dashboard extends app.meta.Model {
    constructor(ctx) {
      super(ctx, { table: 'aDashboard', options: { disableDeleted: false } });
    }
  }
  return Dashboard;
};


/***/ }),

/***/ 182:
/***/ ((module) => {

module.exports = app => {
  class DashboardContent extends app.meta.Model {
    constructor(ctx) {
      super(ctx, { table: 'aDashboardContent', options: { disableDeleted: false } });
    }
  }
  return DashboardContent;
};


/***/ }),

/***/ 469:
/***/ ((module) => {

module.exports = app => {
  class DashboardFull extends app.meta.Model {
    constructor(ctx) {
      super(ctx, { table: 'aDashboardViewFull', options: { disableDeleted: false } });
    }
  }
  return DashboardFull;
};


/***/ }),

/***/ 663:
/***/ ((module) => {

module.exports = app => {
  class DashboardUser extends app.meta.Model {
    constructor(ctx) {
      super(ctx, { table: 'aDashboardUser', options: { disableDeleted: false } });
    }
  }
  return DashboardUser;
};


/***/ }),

/***/ 230:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const dashboard = __webpack_require__(456);
const dashboardContent = __webpack_require__(182);
const dashboardUser = __webpack_require__(663);
const dashboardFull = __webpack_require__(469);

module.exports = app => {
  const models = {
    dashboard,
    dashboardContent,
    dashboardUser,
    dashboardFull,
  };
  return models;
};


/***/ }),

/***/ 825:
/***/ ((module) => {

module.exports = app => {
  const routes = [
    // dashboard
    { method: 'post', path: 'dashboard/itemByKey', controller: 'dashboard' },
    { method: 'post', path: 'dashboard/item', controller: 'dashboard',
      meta: { right: { type: 'resource', useKey: true } },
    },
    { method: 'post', path: 'dashboard/loadItemUser', controller: 'dashboard', meta: { auth: { user: true } } },
    { method: 'post', path: 'dashboard/saveItemUser', controller: 'dashboard', meta: { auth: { user: true } } },
    { method: 'post', path: 'dashboard/changeItemUserName', controller: 'dashboard', meta: { auth: { user: true } } },
    { method: 'post', path: 'dashboard/deleteItemUser', controller: 'dashboard', meta: { auth: { user: true } } },
    { method: 'post', path: 'dashboard/createItemUser', controller: 'dashboard',
      meta: { right: { type: 'resource', useKey: true } },
    },
    { method: 'post', path: 'dashboard/itemUsers', controller: 'dashboard',
      meta: { right: { type: 'resource', useKey: true } },
    },
    { method: 'post', path: 'dashboard/changeItemUserDefault', controller: 'dashboard',
      meta: { right: { type: 'resource', useKey: true } },
    },
  ];
  return routes;
};


/***/ }),

/***/ 697:
/***/ ((module) => {

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Dashboard extends app.Service {

    get atomClass() {
      return {
        module: moduleInfo.relativeName,
        atomClassName: 'dashboard',
      };
    }

    get sequence() {
      return this.ctx.bean.sequence.module(moduleInfo.relativeName);
    }

    async itemByKey({ atomStaticKey, user }) {
      if (!atomStaticKey) return this.ctx.throw.module('a-base', 1002);
      // get atomId
      const atomClass = await this.ctx.bean.atomClass.get(this.atomClass);
      const atom = await this.ctx.bean.atom.modelAtom.get({
        atomClassId: atomClass.id,
        atomStaticKey,
        atomStage: 1,
      });
      if (!atom) return this.ctx.throw.module('a-base', 1002);
      const atomId = atom.id;
      // check resource right
      const res = await this.ctx.bean.resource.checkRightResource({ resourceAtomId: atomId, user });
      if (!res) this.ctx.throw(403);
      // item
      return await this.item({ dashboardAtomId: atomId, user });
    }

    async item({ dashboardAtomId, dashboardUserCheck = true, user }) {
      // try get default of dashboardUser
      if (dashboardUserCheck) {
        const dashboardUser = await this.ctx.model.dashboardUser.get({
          dashboardAtomId,
          dashboardDefault: 1,
          userId: user.id,
        });
        if (dashboardUser) {
          return { dashboardUser };
        }
      }
      // get system
      const dashboardSystem = await this.ctx.bean.atom.read({
        key: { atomId: dashboardAtomId }, user,
      });
      return { dashboardSystem };
    }

    async loadItemUser({ dashboardUserId, user }) {
      return await this.ctx.model.dashboardUser.get({
        id: dashboardUserId,
        userId: user.id,
      });
    }

    async saveItemUser({ dashboardUserId, content, user }) {
      await this.ctx.model.dashboardUser.update({
        content,
      }, { where: {
        id: dashboardUserId,
        userId: user.id,
      } });
    }

    async changeItemUserName({ dashboardUserId, dashboardName, user }) {
      await this.ctx.model.dashboardUser.update({
        dashboardName,
      }, { where: {
        id: dashboardUserId,
        userId: user.id,
      } });
    }

    async deleteItemUser({ dashboardUserId, user }) {
      await this.ctx.model.dashboardUser.delete({
        id: dashboardUserId,
        userId: user.id,
      });
    }

    async createItemUser({ dashboardAtomId, user }) {
      // name
      const id = await this.sequence.next('dashboard');
      const dashboardName = `${this.ctx.text('Dashboard')}-${id}`;
      // content
      const dashboardContent = await this.ctx.model.dashboardContent.get({ atomId: dashboardAtomId });
      // update old default
      await this.ctx.model.dashboardUser.update({
        dashboardDefault: 0,
      }, { where: {
        userId: user.id,
        dashboardAtomId,
      } });
      // insert
      const res = await this.ctx.model.dashboardUser.insert({
        userId: user.id,
        dashboardDefault: 1,
        dashboardAtomId,
        dashboardName,
        content: dashboardContent.content,
      });
      // ok
      return {
        dashboardUserId: res.insertId,
      };
    }

    async itemUsers({ dashboardAtomId, user }) {
      return await this.ctx.model.dashboardUser.select({
        columns: [ 'id', 'createdAt', 'updatedAt', 'deleted', 'iid', 'userId', 'dashboardDefault', 'dashboardAtomId', 'dashboardName' ],
        where: {
          userId: user.id,
          dashboardAtomId,
        },
        orders: [[ 'dashboardName', 'asc' ]],
      });
    }

    async changeItemUserDefault({ dashboardAtomId, dashboardUserId, user }) {
      await this.ctx.model.dashboardUser.update({
        dashboardDefault: 0,
      }, { where: {
        userId: user.id,
        dashboardAtomId,
      } });
      await this.ctx.model.dashboardUser.update({
        id: dashboardUserId,
        dashboardDefault: 1,
      });
    }

  }

  return Dashboard;
};


/***/ }),

/***/ 214:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const dashboard = __webpack_require__(697);

module.exports = app => {
  const services = {
    dashboard,
  };
  return services;
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