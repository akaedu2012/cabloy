module.exports = app => {
  // const schemas = require('./config/validation/schemas.js')(app);
  const meta = {
    base: {
      atoms: {
      },
    },
    validation: {
      validators: {
      },
      keywords: {},
      schemas: {
      },
    },
    event: {
      implementations: {
        'a-dingtalk:dingtalkCallback': 'dingtalkCallback',
        'a-base:loginInfo': 'loginInfo',
      },
    },
  };
  return meta;
};
