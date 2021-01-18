module.exports = app => {
  // actionPath
  const actionPath = '/a/flowtask/flowTask/tabs';
  // resource
  const resource = {
    atomName: 'Tasks',
    atomStaticKey: 'mineWorkFlowTasks',
    atomRevision: 0,
    atomCategoryId: 'a-base:mine.WorkFlow',
    resourceType: 'a-base:mine',
    resourceConfig: JSON.stringify({
      actionPath,
      stats: {
        params: {
          module: 'a-flowtask',
          name: 'taskClaimingsHandlings',
        },
        color: 'red',
      },
    }),
    resourceRoles: 'root',
    resourceSorting: 1,
  };
  return resource;
};
