module.exports = app => {
  // const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const resources = [
    {
      atomName: 'Icons',
      atomStaticKey: 'icons',
      atomRevision: 3,
      atomCategoryId: 'a-base:menu.Tools',
      resourceType: 'a-base:menu',
      resourceConfig: JSON.stringify({
        actionPath: '/a/icon/icons',
      }),
      resourceIcon: ':outline:insert-emoticon-outline',
      appKey: 'a-appbooster:appSystem',
      resourceRoles: 'template.system',
    },
  ];
  // ok
  return resources;
};
