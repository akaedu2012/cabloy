module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  return {
    systemRoles: [
      'root',
      'anonymous',
      'authenticated',
      'template',
      'system',
      'registered',
      'activated',
      'superuser',
      'builtIn',
      'organization',
      'internal',
      'external',
    ],
    atom: {
      stage: {
        draft: 0,
        formal: 1,
        history: 2,
      },
      action: {
        create: 1,
        read: 2,
        write: 3,
        delete: 4,
        clone: 5,
        enable: 6,
        disable: 7,
        layout: 15,
        // report: 16,

        authorize: 25,

        deleteBulk: 35,
        exportBulk: 36,
        importBulk: 37,
        // reportBulk: 38,
        layoutBulk: 45,

        save: 51,
        submit: 52,
        history: 53,
        formal: 54,
        draft: 55,
        workflow: 56,

        //
        draftStatsBulk: 71,
        readBulk: 72,

        custom: 100, // custom action start from custom
      },
      actionMeta: {
        create: {
          title: 'Create',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          bulk: true,
          select: false,
          icon: { f7: '::add' },
        },
        read: {
          title: 'View',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          // actionPath: '/a/basefront/atom/item?mode=view&atomId={{atomId}}&itemId={{itemId}}',
          enableOnStatic: true,
          enableOnOpened: true,
          icon: { f7: '::visibility' },
        },
        write: {
          title: 'Edit',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          enableOnStatic: false,
          enableOnOpened: false,
          icon: { f7: '::edit' },
        },
        delete: {
          title: 'Delete',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          enableOnStatic: false,
          enableOnOpened: false,
          icon: { f7: '::delete' },
        },
        clone: {
          title: 'Clone',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          enableOnStatic: true,
          enableOnOpened: true,
          icon: { f7: ':outline:copy-outline' },
        },
        enable: {
          title: 'Enable',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          enableOnStatic: true,
          enableOnOpened: true,
          stage: 'formal',
          icon: { f7: '::play-arrow' },
        },
        disable: {
          title: 'Disable',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          enableOnStatic: true,
          enableOnOpened: true,
          stage: 'formal',
          icon: { f7: '::stop' },
        },
        layout: {
          title: 'Layout',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          enableOnStatic: true,
          enableOnOpened: true,
          disableInList: true,
          icon: { f7: '::view-list' },
        },
        authorize: {
          title: 'Authorize',
          actionModule: moduleInfo.relativeName,
          actionPath: '/a/basefront/resource/authorize?atomId={{atomId}}&itemId={{itemId}}',
          enableOnStatic: true,
          enableOnOpened: true,
          stage: 'formal',
          icon: { f7: '::groups' },
        },
        deleteBulk: {
          title: 'Delete',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'actionBulk',
          bulk: true,
          select: true,
          icon: { f7: '::delete' },
        },
        exportBulk: {
          title: 'Export',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'actionBulk',
          bulk: true,
          select: null,
          icon: { f7: '::export' },
        },
        importBulk: {
          title: 'Import',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'actionBulk',
          bulk: true,
          select: null,
          icon: { f7: '::import' },
          params: {
            file: {
              mode: 'buffer',
            },
            progress: true,
            transaction: true,
            accept: '',
          },
        },
        layoutBulk: {
          title: 'Layout',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'actionBulk',
          bulk: true,
          select: null,
          icon: { f7: '::view-list' },
        },
        draftStatsBulk: {
          title: 'Draft',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'actionBulk',
          render: {
            module: 'a-baserender',
            name: 'renderAtomListDraftStats',
          },
          bulk: true,
          select: false,
          stage: 'formal',
          icon: { f7: ':outline:draft-outline' },
          authorize: false,
        },
        readBulk: {
          title: 'List',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'actionBulk',
          bulk: true,
          icon: { f7: '::visibility' },
          authorize: false,
        },
        save: {
          title: 'Save',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          authorize: false,
          icon: { f7: '::save' },
        },
        submit: {
          title: 'Submit',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          authorize: false,
          icon: { f7: '::done' },
        },
        history: {
          title: 'History',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          authorize: false,
          icon: { f7: ':outline:work-history-outline' },
        },
        formal: {
          title: 'Formal',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          authorize: false,
          icon: { f7: ':outline:archive-outline' },
        },
        draft: {
          title: 'Draft',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          authorize: false,
          icon: { f7: ':outline:draft-outline' },
        },
        workflow: {
          title: 'WorkFlow',
          actionModule: moduleInfo.relativeName,
          actionComponent: 'action',
          authorize: false,
          icon: { f7: '::flow-chart' },
        },
        custom: {
          title: 'Custom',
        },
      },
    },
  };
};
