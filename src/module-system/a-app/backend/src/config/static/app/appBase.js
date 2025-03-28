module.exports = app => {
  // const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const content = {
    presets: {
      anonymous: {
        mobile: {
          layout: null,
          menu: {
            layout: null,
          },
          home: {
            mode: null,
            dashboard: null,
            page: null,
          },
          mine: {
            layout: null,
          },
        },
        pc: {
          layout: null,
          menu: {
            layout: null,
          },
          home: {
            mode: null,
            dashboard: null,
            page: null,
          },
          mine: {
            layout: null,
          },
        },
      },
      authenticated: {
        mobile: {
          layout: null,
          menu: {
            layout: null,
          },
          home: {
            mode: null,
            dashboard: null,
            page: null,
          },
          mine: {
            layout: null,
          },
        },
        pc: {
          layout: null,
          menu: {
            layout: null,
          },
          home: {
            mode: null,
            dashboard: null,
            page: null,
          },
          mine: {
            layout: null,
          },
        },
      },
    },
  };
  const _app = {
    atomName: 'Base',
    atomStaticKey: 'appBase',
    atomRevision: 1,
    atomCategoryId: 0,
    description: '',
    appIcon: ':outline:apps-outline',
    appIsolate: true,
    appHidden: 1,
    content: JSON.stringify(content),
    resourceRoles: 'root',
    appSorting: 0,
  };
  return _app;
};
