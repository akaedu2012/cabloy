const authFn = require('./passport/auth.js');

module.exports = app => {
  const schemas = require('./config/validation/schemas.js')(app);
  // socketio
  const socketioMessageProgress = require('./config/socketio/messageProgress.js')(app);
  const socketioChannelApp = require('./config/socketio/channelApp.js')(app);
  const meta = {
    base: {
      atoms: {
      },
    },
    validation: {
      validators: {
        settingsInstance: {
          schemas: 'settingsInstance',
        },
      },
      keywords: {},
      schemas: {
        settingsInstance: schemas.settingsInstance,
      },
    },
    settings: {
      instance: {
        validator: 'settingsInstance',
      },
    },
    event: {
      declarations: {
      },
      implementations: {
        'a-base:loginInfo': 'loginInfo',
        'a-base:accountMigration': 'accountMigration',
      },
    },
    socketio: {
      messages: {
        progress: socketioMessageProgress,
      },
      channels: {
        app: socketioChannelApp,
      },
    },
    auth: authFn,
  };
  return meta;
};
