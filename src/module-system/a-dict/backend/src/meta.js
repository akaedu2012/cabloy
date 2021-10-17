module.exports = app => {
  // schemas
  const schemas = require('./config/validation/schemas.js')(app);
  // static
  const staticResources = require('./config/static/resources.js')(app);
  // meta
  const meta = {
    base: {
      atoms: {
        dict: {
          info: {
            bean: 'dict',
            title: 'Dict',
            tableName: 'aDict',
            language: false,
            category: true,
            tag: true,
          },
          actions: {},
          validator: 'dict',
          search: {
            validator: 'dictSearch',
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
        dict: {
          schemas: 'dict',
        },
        dictSearch: {
          schemas: 'dictSearch',
        },
      },
      keywords: {},
      schemas,
    },
    index: {
      indexes: {
        aDict: 'createdAt,updatedAt,atomId',
      },
    },
  };
  return meta;
};
