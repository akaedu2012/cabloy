const versionManager = require('./bean/version.manager.js');
const eventLoginInfo = require('./bean/event.loginInfo.js');
const eventAccountMigration = require('./bean/event.accountMigration.js');
const queueContacts = require('./bean/queue.contacts.js');
const middlewareInWxwork = require('./bean/middleware.inWxwork.js');
const ioChannelApp = require('./bean/io.channel.app.js');
const beanWxwork = require('./bean/bean.wxwork.js');

module.exports = app => {
  const beans = {
    // version
    'version.manager': {
      mode: 'app',
      bean: versionManager,
    },
    // event
    'event.loginInfo': {
      mode: 'ctx',
      bean: eventLoginInfo,
    },
    'event.accountMigration': {
      mode: 'ctx',
      bean: eventAccountMigration,
    },
    // queue
    'queue.contacts': {
      mode: 'app',
      bean: queueContacts,
    },
    // middleware
    'middleware.inWxwork': {
      mode: 'ctx',
      bean: middlewareInWxwork,
    },
    // io
    'io.channel.app': {
      mode: 'ctx',
      bean: ioChannelApp,
    },
    // global
    wxwork: {
      mode: 'ctx',
      bean: beanWxwork,
      global: true,
    },
  };
  return beans;
};
