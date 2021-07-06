export default {
  data() {
    return {
      base: {
        ready: false,
        configAtomBase: null,
        configAtom: null,
        config: null,
        //
        item: null,
        atomClass: null,
        module: null,
        validateParams: null,
        notfound: false,
      },
    };
  },
  computed: {
    base_ready() {
      return this.base.ready && this.base_userLabels && this.atomClassesAll && this.actionsAll;
    },
    base_user() {
      return this.$store.state.auth.user.op;
    },
    base_userLabels() {
      return this.$store.getters['a/base/userLabels'];
    },
  },
  created() {
    this.$store.dispatch('a/base/getLabels');
  },
  mounted() {
    this.$meta.eventHub.$on('atom:star', this.base_onStarChanged);
    this.$meta.eventHub.$on('atom:labels', this.base_onLabelsChanged);
    this.$meta.eventHub.$on('atom:action', this.base_onActionChanged);
    this.$meta.eventHub.$on('atom:actions', this.base_onActionsChanged);
    this.$meta.eventHub.$on('comment:action', this.base_onCommentChanged);
    this.$meta.eventHub.$on('attachment:action', this.base_onAttachmentChanged);
  },
  beforeDestroy() {
    this.$meta.eventHub.$off('atom:star', this.base_onStarChanged);
    this.$meta.eventHub.$off('atom:labels', this.base_onLabelsChanged);
    this.$meta.eventHub.$off('atom:action', this.base_onActionChanged);
    this.$meta.eventHub.$off('atom:actions', this.base_onActionsChanged);
    this.$meta.eventHub.$off('comment:action', this.base_onCommentChanged);
    this.$meta.eventHub.$off('attachment:action', this.base_onAttachmentChanged);
  },
  methods: {
    async base_loadItem() {
      try {
        // item
        const options = this.base_prepareReadOptions();
        this.base.item = await this.$api.post('/a/base/atom/read', {
          key: { atomId: this.container.atomId },
          options,
        });
        // atomClass
        this.base.atomClass = {
          id: this.base.item.atomClassId,
          module: this.base.item.module,
          atomClassName: this.base.item.atomClassName,
        };
        // module
        this.base.module = await this.$meta.module.use(this.base.item.module);
        // validateParams
        const res = await this.$api.post('/a/base/atom/validator', {
          atomClass: { id: this.base.item.atomClassId },
        });
        this.base.validateParams = {
          module: res.module,
          validator: res.validator,
        };
        // actions
        await this.actions_fetchActions();
        return true;
      } catch (err) {
        this.base.notfound = true;
        return false;
      }
    },
    base_prepareReadOptions() {
      // options
      const options = {};
      // layout
      options.layout = this.layout.current;
      // options
      return options;
    },
    base_getCurrentStage() {
      if (!this.base.item) return null;
      const stage = this.base.item.atomStage;
      if (stage === undefined) return undefined;
      return stage === 0 ? 'draft' : stage === 1 ? 'formal' : 'history';
    },
    async base_onActionChanged(data) {
      const key = data.key;
      const action = data.action;

      if (!this.base_ready) return;
      if (this.base.item.atomId !== key.atomId) return;

      if (this.container.mode === 'edit') {
        // just update time
        this.base.item.atomUpdatedAt = new Date();
        return;
      }

      // create
      if (action.menu === 1 && action.action === 'create') {
        // do nothing
        return;
      }
      // not check delete
      //    for: delete on atom list but not delete on atom when atomClosed=1
      // // delete
      // if (action.name === 'delete') {
      //   this.base.item = null;
      //   this.base.notfound = true;
      //   this.base.ready = false;
      //   return;
      // }
      // others
      await this.base_loadItem();
    },
    async base_onActionsChanged(data) {
      const key = data.key;

      if (!this.base_ready) return;
      if (this.base.item.atomId !== key.atomId) return;

      await this.actions_fetchActions();
    },
    async base_onOpenDrafted(data) {
      const key = data.key;

      if (!this.base_ready) return;
      if (this.base.item.atomId !== key.atomId) return;

      await this.actions_fetchActions();
    },
    base_onCommentChanged(data) {
      if (!this.base.item || data.atomId !== this.container.atomId) return;
      if (data.action === 'create') this.base.item.commentCount += 1;
      if (data.action === 'delete') this.base.item.commentCount -= 1;
    },
    base_onAttachmentChanged(data) {
      if (!this.base.item || data.atomId !== this.container.atomId) return;
      if (data.action === 'create') this.base.item.attachmentCount += 1;
      if (data.action === 'delete') this.base.item.attachmentCount -= 1;
    },
    base_onStarChanged(data) {
      if (!this.base.item || data.key.atomId !== this.container.atomId) return;
      this.base.item.star = data.star;
    },
    base_onLabelsChanged(data) {
      if (!this.base.item || data.key.atomId !== this.container.atomId) return;
      this.base.item.labels = JSON.stringify(data.labels);
    },
  },
};
