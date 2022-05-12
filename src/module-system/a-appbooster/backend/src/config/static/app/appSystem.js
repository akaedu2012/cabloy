module.exports = app => {
  // const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const content = {
    presets: {
      anonymous: {},
      authenticated: {},
    },
  };
  const _app = {
    atomName: 'System',
    atomStaticKey: 'appSystem',
    atomRevision: 0,
    atomCategoryId: 'System',
    description: '',
    appIcon: '::menu',
    appIsolate: false,
    content: JSON.stringify(content),
    resourceRoles: 'template.system',
    appSorting: 0,
  };
  return _app;
};
