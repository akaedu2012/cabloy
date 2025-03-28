module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  // schemas
  const schemas = require('./config/validation/schemas.js')(app);
  // static
  const staticLayouts = require('./config/static/layouts.js')(app);
  const staticResources = require('./config/static/resources.js')(app);
  // meta
  const meta = {
    base: {
      atoms: {
        userOnline: {
          info: {
            bean: 'userOnline',
            title: 'Online Users',
            tableName: 'aUserOnline',
            language: false,
            category: false,
            tag: false,
            simple: true,
            history: false,
            inner: true,
            comment: false,
            attachment: false,
            layout: {
              config: {
                atomList: 'layoutAtomListUserOnline',
              },
            },
          },
          actions: {
            kickOut: {
              code: 101,
              title: 'ActionKickOut',
              actionModule: moduleInfo.relativeName,
              actionComponent: 'action',
              icon: { f7: ':outline:log-out-outline' },
              // enableOnOpened: true,
              stage: 'formal',
            },
          },
          validator: 'userOnline',
          search: {
            validator: 'userOnlineSearch',
          },
        },
        userOnlineHistory: {
          info: {
            bean: 'userOnlineHistory',
            title: 'Online Users(History)',
            tableName: 'aUserOnlineHistory',
            language: false,
            category: false,
            tag: false,
            simple: true,
            history: false,
            inner: true,
            comment: false,
            attachment: false,
          },
          actions: {},
          validator: 'userOnlineHistory',
          search: {
            validator: 'userOnlineHistorySearch',
          },
        },
      },
      statics: {
        'a-baselayout.layout': {
          items: staticLayouts,
        },
        'a-base.resource': {
          items: staticResources,
        },
      },
    },
    validation: {
      validators: {
        userOnline: {
          schemas: 'userOnline',
        },
        userOnlineSearch: {
          schemas: 'userOnlineSearch',
        },
        userOnlineHistory: {
          schemas: 'userOnlineHistory',
        },
        userOnlineHistorySearch: {
          schemas: 'userOnlineHistorySearch',
        },
      },
      keywords: {},
      schemas,
    },
    index: {
      indexes: {
        aUserOnline: 'createdAt,updatedAt,atomId,userId,onlineTimeLast,expireTime',
        aUserOnlineHistory: 'createdAt,updatedAt,atomId,userId,onlineTime',
      },
    },
  };
  return meta;
};
