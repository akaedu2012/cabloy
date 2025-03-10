export default {
  methods: {
    async _onActionCreate() {
      const { ctx, action, item } = this.$props;
      // get roleIdOwner
      const roleIdOwner = await this._onActionCreateGetRoleIdOwner();
      if (!roleIdOwner) return;
      // create
      const { key, atom } = await ctx.$api.post('/a/base/atom/create', {
        atomClass: {
          id: item.atomClassId,
          module: item.module,
          atomClassName: item.atomClassName,
        },
        roleIdOwner,
        item,
        options: {
          returnAtom: true,
        },
      });
      // event
      ctx.$meta.eventHub.$emit('atom:action', { key, action, atom });
      // menu
      if (!action.__noActionWrite) {
        const itemWrite = ctx.$utils.extend({}, item, key);
        // write
        const actionsAll = await ctx.$store.dispatch('a/base/getActions');
        let actionWrite = actionsAll[itemWrite.module][itemWrite.atomClassName].write;
        actionWrite = ctx.$utils.extend({}, actionWrite, { navigateOptions: action.navigateOptions });
        return await ctx.$meta.util.performAction({ ctx, action: actionWrite, item: itemWrite });
      }
      // just return key
      return key;
    },
    async _onActionCreateGetRoleIdOwner() {
      const { ctx } = this.$props;
      const atomClassId = await this._onActionCreateGetAtomClassId();
      // check cache from vuex
      const userAtomClassRolesPreferred = ctx.$store.getState('a/base/userAtomClassRolesPreferred');
      if (userAtomClassRolesPreferred[atomClassId]) return userAtomClassRolesPreferred[atomClassId];
      // get preferred roles
      const roles = await ctx.$api.post('/a/base/atom/preferredRoles', {
        atomClass: { id: atomClassId },
      });
      // 0/1
      if (roles.length === 0) throw new Error('Error');
      if (roles.length === 1) {
        const roleIdOwner = roles[0].roleIdWho;
        ctx.$store.commit('a/base/setUserAtomClassRolesPreferred', { atomClassId, roleIdOwner });
        return roleIdOwner;
      }
      // >1
      const roleIdOwner = await this._onActionCreateSelectPreferredRole({ roles });
      if (roleIdOwner) {
        ctx.$store.commit('a/base/setUserAtomClassRolesPreferred', { atomClassId, roleIdOwner });
      }
      return roleIdOwner;
    },
    async _onActionCreateGetAtomClassId() {
      const { ctx, item } = this.$props;
      if (item.atomClassId) return item.atomClassId;
      const atomClass = await ctx.$api.post('/a/base/atomClass/atomClass', {
        atomClass: {
          module: item.module,
          atomClassName: item.atomClassName,
        },
      });
      return atomClass.id;
    },
    async _onActionCreateSelectPreferredRole({ roles }) {
      const { ctx, action } = this.$props;
      // buttons
      const buttons = [
        {
          text: ctx.$text('AtomClassSelectRoleTip'),
          label: true,
        },
      ];
      for (const role of roles) {
        buttons.push({
          text: role.roleNameWho,
          data: role,
        });
      }
      // choose
      const params = {
        targetEl: action.targetEl,
        buttons,
      };
      try {
        const button = await ctx.$view.actions.choose(params);
        return button.data.roleIdWho;
      } catch (err) {
        return null;
      }
    },
  },
};
