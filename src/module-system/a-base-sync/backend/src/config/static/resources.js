module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const resourceMines = require('./mines.js')(app);
  let resources = [
    // function
    {
      atomName: 'Delete Comment',
      atomStaticKey: 'deleteComment',
      atomRevision: 0,
      atomCategoryId: 'a-base:function.Tools',
      resourceType: 'a-base:function',
      resourceConfig: null,
      resourceRoles: 'template.system',
    },
    // menu
    {
      atomName: 'Create Resource',
      atomStaticKey: 'createResource',
      atomRevision: 0,
      atomCategoryId: 'a-base:menu.Create',
      resourceType: 'a-base:menu',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        atomClassName: 'resource',
        atomAction: 'create',
      }),
      resourceRoles: 'template.system',
    },
    {
      atomName: 'Resource List',
      atomStaticKey: 'listResource',
      atomRevision: 0,
      atomCategoryId: 'a-base:menu.List',
      resourceType: 'a-base:menu',
      resourceConfig: JSON.stringify({
        module: moduleInfo.relativeName,
        atomClassName: 'resource',
        atomAction: 'read',
      }),
      resourceRoles: 'template.system',
    },
    {
      atomName: 'Comment List',
      atomStaticKey: 'listComment',
      atomRevision: 2,
      atomCategoryId: 'a-base:menu.Tools',
      resourceType: 'a-base:menu',
      resourceConfig: JSON.stringify({
        actionPath: '/a/basefront/comment/all',
      }),
      resourceIcon: '::comment-dots',
      appKey: 'a-appbooster:appSystem',
      resourceRoles: 'root',
    },
    {
      atomName: 'Developer Tool',
      atomStaticKey: 'developerTool',
      atomRevision: 3,
      atomCategoryId: 'a-base:menu.Tools',
      resourceType: 'a-base:menu',
      resourceConfig: JSON.stringify({
        actionModule: 'a-basefront',
        actionComponent: 'developerTool',
        name: 'initialize',
      }),
      resourceIcon: '::developer-board',
      appKey: 'a-appbooster:appSystem',
      resourceRoles: 'template.system',
    },
  ];
  // mine
  resources = resources.concat(resourceMines);
  // ok
  return resources;
};
