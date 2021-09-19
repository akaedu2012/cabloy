module.exports = app => {
  const schemas = {};
  // filterTabBasic
  schemas.filterTabBasic = {
    type: 'object',
    properties: {
      atomName: {
        type: 'string',
        ebType: 'text',
        ebTitle: 'Atom Name',
        ebSearch: {
          // fieldName: 'atomName',
          // tableAlias: 'a',
          // ignoreValue:0,
          operators: 'like,likeLeft,likeRight,=', // {} } { =
          combine: {
            actionModule: 'a-baselayout',
            actionComponent: 'combineSearch',
            name: 'atomName',
          },
        },
      },
      stage: {
        type: 'string',
        ebType: 'select',
        ebTitle: 'Stage',
        ebParams: { openIn: 'sheet', closeOnSelect: true },
        ebDisplay: {
          expression: '_meta.host.stages.length>1',
        },
        ebSearch: {
          tableAlias: null,
          operators: 'like,likeLeft,likeRight,=', // {} } { =
        },
      },
      __divider: {
        ebType: 'divider',
      },
      atomClass: {
        type: 'object',
        ebType: 'atomClass',
        ebTitle: 'Atom Class',
        ebParams: {
          optional: true,
        },
        ebDisplay: {
          expression: '!_meta.host.container.atomClass',
        },
        ebSearch: {
          tableAlias: null,
        },
      },
    },
  };
  return schemas;
};
