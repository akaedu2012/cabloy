const versionManager = require('./bean/version.manager.js');
const eventAccountMigration = require('./bean/event.accountMigration.js');
const atomAuthOpen = require('./bean/atom.authOpen.js');
const authProviderOpen = require('./bean/auth.provider.open.js');

module.exports = app => {
  const beans = {
    // version
    'version.manager': {
      mode: 'app',
      bean: versionManager,
    },
    // event
    'event.accountMigration': {
      mode: 'ctx',
      bean: eventAccountMigration,
    },
    // atom
    'atom.authOpen': {
      mode: 'app',
      bean: atomAuthOpen,
    },
    // auth.provider
    'auth.provider.open': {
      mode: 'ctx',
      bean: authProviderOpen,
    },
  };
  return beans;
};
