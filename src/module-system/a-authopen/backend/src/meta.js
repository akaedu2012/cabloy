const authFn = require('./config/passport/auth.js');

// actionPathListOpenAuthSelf
const _options = {
  stage: 'formal',
  mine: 1,
};
const actionPathListOpenAuthSelf = `/a/basefront/atom/list?module=a-authopen&atomClassName=authOpen&options=${encodeURIComponent(
  JSON.stringify(_options)
)}`;

module.exports = app => {
  // schemas
  const schemas = require('./config/validation/schemas.js')(app);
  // static
  const staticResources = require('./config/static/resources.js')(app);
  // meta
  const meta = {
    auth: authFn,
    base: {
      atoms: {
        authOpen: {
          info: {
            bean: 'authOpen',
            title: 'Open Auth',
            tableName: 'aAuthOpen',
            tableNameModes: {
              default: 'aAuthOpenView',
            },
            simple: true,
            history: false,
            inner: true,
            fields: {
              custom: ['clientID,clientSecret,clientSecretHidden'],
            },
          },
          actions: {
            hideClientSecret: {
              code: 101,
              title: 'Hide Client Secret',
              actionModule: 'a-authopen',
              actionComponent: 'action',
              icon: { f7: ':outline:visibility-off-outline' },
            },
            resetClientSecret: {
              code: 102,
              title: 'Reset Client Secret',
              actionModule: 'a-authopen',
              actionComponent: 'action',
              icon: { f7: ':outline:key-reset-outline' },
            },
          },
          validator: 'authOpen',
          search: {
            validator: 'authOpenSearch',
          },
        },
      },
      statics: {
        'a-base.resource': {
          items: staticResources,
        },
      },
    },
    validation: {
      validators: {
        authOpen: {
          schemas: 'authOpen',
        },
        authOpenSearch: {
          schemas: 'authOpenSearch',
        },
      },
      keywords: {},
      schemas,
    },
    settings: {
      user: {
        actionPath: actionPathListOpenAuthSelf,
      },
    },
    event: {
      implementations: {
        'a-base:accountMigration': 'accountMigration',
      },
    },
    index: {
      indexes: {
        aAuthOpen: 'createdAt,updatedAt,atomId,userId,scopeRoleId',
      },
    },
  };
  return meta;
};
