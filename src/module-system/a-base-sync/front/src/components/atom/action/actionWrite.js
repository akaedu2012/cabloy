export default {
  methods: {
    async _onActionWrite() {
      const { ctx, action, item } = this.$props;
      const key = { atomId: item.atomId, itemId: item.itemId };
      // openDraft
      const data = await ctx.$api.post('/a/base/atom/openDraft', { key });
      const dataRes = data.draft || data.formal;
      const keyWrite = dataRes.key;
      const atomWrite = dataRes.atom;
      const changed = data.changed;
      // emit
      if (changed) {
        ctx.$meta.eventHub.$emit('atom:action', { key: keyWrite, action: { name: 'create' }, atom: atomWrite });
      }
      // navigate
      const url = ctx.$meta.util.replaceTemplate(
        '/a/basefront/atom/item?mode=edit&atomId={{atomId}}&itemId={{itemId}}',
        atomWrite
      );
      ctx.$view.navigate(url, action.navigateOptions);
      // event: neednot check atomStage
      // if (item.atomStage > 0) {
      //   ctx.$meta.eventHub.$emit('atom:actions', { key });
      // }
      if (changed) {
        ctx.$meta.eventHub.$emit('atom:actions', { key });
      }
    },
  },
};
