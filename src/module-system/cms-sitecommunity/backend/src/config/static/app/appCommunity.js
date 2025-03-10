module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const info = {
    home: {
      mode: 'page',
      page: '/a/basefront/atom/list?module=cms-sitecommunity&atomClassName=post',
    },
  };
  const content = {
    info: {
      atomClass: {
        module: moduleInfo.relativeName,
        atomClassName: 'post',
      },
    },
    presets: {
      anonymous: {
        mobile: info,
        pc: info,
      },
      authenticated: {
        mobile: info,
        pc: info,
      },
    },
  };
  const _app = {
    atomName: 'Community',
    atomStaticKey: 'appCommunity',
    atomRevision: 4,
    atomCategoryId: 'AppCategoryFront',
    description: '',
    appIcon: ':outline:article-outline',
    appIsolate: false,
    appLanguage: true,
    appCms: true,
    content: JSON.stringify(content),
    resourceRoles: 'root',
    appSorting: 0,
  };
  return _app;
};
