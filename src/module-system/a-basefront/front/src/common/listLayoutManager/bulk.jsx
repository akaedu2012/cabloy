import AtomButton from '../../components/atom/atomButton.vue';

export default {
  components: { AtomButton },
  data() {
    return {
      bulk: {
        actions: null,
        selectedAtoms: [],
        selecting: false,
      },
    };
  },
  methods: {
    async bulk_actionsInit() {
      if (this.container.atomClass && this.container.scene !== 'select' && this.container.scene !== 'selecting') {
        await this.bulk_loadActions();
      }
    },
    async bulk_onAction(event, action) {
      this.$f7.tooltip.hide(event.currentTarget);
      // action
      let _action = this.getAction(action);
      if (!_action) return;
      _action = this.$utils.extend({}, _action, { targetEl: event.currentTarget });
      // item
      let item = {
        atomClassId: action.atomClassId,
        module: action.module,
        atomClassName: action.atomClassName,
        atomClassIdParent: action.atomClassIdParent,
      };
      if (_action.name === 'create') {
        const createParams = this.$meta.util.getProperty(this.container.params, 'createParams');
        if (createParams) {
          item = this.$utils.extend({}, item, createParams);
        }
        const params = this.base_prepareSelectParams({ setOrder: false });
        if (params.options.language) {
          item.atomLanguage = params.options.language;
        }
        if (params.options.category) {
          item.atomCategoryId = params.options.category;
        }
      }
      // performAction
      return await this.$meta.util.performAction({ ctx: this, action: _action, item });
    },
    async bulk_loadActions() {
      if (this.bulk.actions) return;
      const actions = await this.$api.post('/a/base/atom/actionsBulk', {
        atomClass: this.container.atomClass,
        stage: this.base_getCurrentStage(),
      });
      this.bulk.actions = this.bulk_patchActions(actions);
    },
    bulk_patchActions(actions) {
      let action;
      const index = actions.findIndex(item => item.name === 'draftStatsBulk');
      if (index > -1) {
        action = actions.splice(index, 1)[0];
      } else {
        action = {
          module: this.container.atomClass.module,
          atomClassName: this.container.atomClass.atomClassName,
          name: 'draftStatsBulk',
          bulk: 1,
          code: 46,
        };
      }
      actions.unshift(action);
      return actions;
    },
    bulk_clearSelectedAtoms() {
      this.bulk.selectedAtoms = [];
    },
    bulk_closeSelecting() {
      this.bulk.selecting = false;
      this.bulk_clearSelectedAtoms();
    },
    bulk_onSelectingSwitch() {
      this.bulk.selecting = !this.bulk.selecting;
      if (!this.bulk.selecting) {
        this.bulk_clearSelectedAtoms();
      }
    },
    bulk_onItemChange(event, item) {
      const selectedAtoms = this.bulk.selectedAtoms;
      const index = selectedAtoms.findIndex(_item => _item.atomId === item.atomId);
      if (event.currentTarget.checked && index === -1) {
        selectedAtoms.push(item);
      } else if (!event.currentTarget.checked && index > -1) {
        selectedAtoms.splice(index, 1);
      }
    },
    bulk_onSelectingChecking() {
      const items = this.base_getItems();
      const selectedAtoms = this.bulk.selectedAtoms;
      if (selectedAtoms.length >= items.length) {
        // uncheck all
        this.bulk.selectedAtoms = [];
      } else {
        // check all
        this.bulk.selectedAtoms = items.concat();
      }
    },
    bulk_renderActionsLeft() {
      const children = [];
      // switch select
      const items = this.base_getItems();
      const selectedAtoms = this.bulk.selectedAtoms;
      if (items.length > 0 || this.bulk.selecting) {
        children.push(
          <eb-link
            key="actionsLeft:select"
            iconF7="::grading"
            tooltip={this.$text('Select')}
            propsOnPerform={this.bulk_onSelectingSwitch}
          ></eb-link>
        );
      }
      if (this.bulk.selecting) {
        children.push(
          <eb-link
            key="actionsLeft:selectChecking"
            iconF7={selectedAtoms.length === 0 ? ':outline:checkbox-outline' : '::checkbox-checked'}
            iconBadge={selectedAtoms.length.toString()}
            propsOnPerform={this.bulk_onSelectingChecking}
          ></eb-link>
        );
      }
      return children;
    },
    bulk_renderActionsLeftB() {
      const children = [];
      // switch select
      // not check items.length > 0, so as to avoid splash
      // const items = this.base_getItems();
      const selectedAtoms = this.bulk.selectedAtoms;
      // if (items.length > 0 || this.bulk.selecting) {
      children.push(
        <eb-link
          key="actionsLeftB:select"
          iconF7="::grading"
          iconBadge={this.bulk.selecting ? selectedAtoms.length.toString() : 0}
          tooltip={this.$text('Select')}
          propsOnPerform={this.bulk_onSelectingSwitch}
        ></eb-link>
      );
      // }
      return children;
    },
    bulk_renderActionsRight() {
      const children = [];
      const stageCurrent = this.base_getCurrentStage();
      const selectedAtoms = this.bulk.selectedAtoms;
      if (this.bulk.actions && this.actionsAll) {
        for (const action of this.bulk.actions) {
          const actionBase = this.getAction(action);
          if (!this.bulk_renderActionsRight_checkIfRender(actionBase, stageCurrent, selectedAtoms)) {
            continue;
          }
          children.push(this.bulk_renderActionsRight_render(action, actionBase));
        }
      }
      return children;
    },
    bulk_renderActionsRight_render(action, actionBase) {
      // default render
      if (!actionBase.render) {
        return (
          <eb-link
            key={`actionsRight:${actionBase.name}`}
            iconMaterial={actionBase.icon && actionBase.icon.material}
            iconF7={actionBase.icon && actionBase.icon.f7}
            tooltip={actionBase.icon && actionBase.titleLocale}
            propsOnPerform={event => this.bulk_onAction(event, action)}
          >
            {!actionBase.icon && actionBase.titleLocale}
          </eb-link>
        );
      }
      // custom render
      return (
        <AtomButton
          key={`actionsRight:${actionBase.name}`}
          layoutManager={this}
          action={action}
          config={actionBase}
          renderParams={actionBase.render}
          propsonPerform={event => this.bulk_onAction(event, action)}
        ></AtomButton>
      );
    },
    bulk_renderActionsRight_checkIfRender(actionBase, stageCurrent, selectedAtoms) {
      // stage
      if (actionBase.stage) {
        const stages = actionBase.stage.split(',');
        if (!stages.some(item => item === stageCurrent)) return false;
      }
      // select
      if (
        actionBase.select === undefined ||
        actionBase.select === null ||
        (actionBase.select === true && selectedAtoms.length > 0) ||
        (actionBase.select === false && !this.bulk.selecting)
      ) {
        return true;
      }
      return false;
    },
  },
};
