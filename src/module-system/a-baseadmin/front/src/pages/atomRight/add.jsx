import Vue from 'vue';
import roleItemBase from '../../components/role/roleItemBase.js';
import AddRender from './add/add_render.jsx';
import AddActions from './add/add_actions.js';

const ebAtomClasses = Vue.prototype.$meta.module.get('a-base').options.mixins.ebAtomClasses;
const ebAtomActions = Vue.prototype.$meta.module.get('a-base').options.mixins.ebAtomActions;
export default {
  mixins: [roleItemBase, ebAtomClasses, ebAtomActions, AddRender, AddActions],
  data() {
    return {
      atomClass: null,
      actionName: '',
      actionSelectOptions: null,
      scopeSelf: false,
      scope: null,
      areaScopeData: {},
      areaScopeSchema: null,
      actionsUser: null,
    };
  },
  computed: {
    ready() {
      return this.role && this.atomClassesAll && this.actionsAll;
    },
    scopeTitle() {
      if (!this.scope) return null;
      return this.scope.map(item => item.atomNameLocale).join(',');
    },
    scopeSelfEnable() {
      const action = this.actionCurrent;
      if (!action) return false;
      // set scopes=[] rather then scoleSelf to support multilevelAuthorization
      if (action.actionMode === 1) {
        return false;
      }
      return !action.bulk;
    },
    scopeEnable() {
      const action = this.actionCurrent;
      if (!action) return false;
      // set scopes=[] rather then scoleSelf to support multilevelAuthorization
      if (action.actionMode === 1) {
        return true;
      }
      return !action.bulk && !this.scopeSelf;
    },
    areaScopeEnable() {
      if (!this.scopeEnable) return false;
      if (!this.$meta.config.modules['a-base'].areaScope.enable) return false;
      const atomClassInfo = this.getAtomClass(this.atomClass);
      return !!atomClassInfo.areaScope;
    },
    areaScopeMeta() {
      if (!this.atomClass) return null;
      const atomClassInfo = this.getAtomClass(this.atomClass);
      return atomClassInfo.areaScope;
    },
    actionCurrent() {
      if (!this.atomClass || !this.actionName) return null;
      // normal
      const action = this.getAction({
        module: this.atomClass.module,
        atomClassName: this.atomClass.atomClassName,
        name: this.actionName,
      });
      if (action) return action;
      // flow
      return this.actionsUser.find(item => item.actionId === parseInt(this.actionName));
    },
    isOpenAuthScope() {
      return this.role && this.role.roleTypeCode === 6;
    },
  },
  watch: {
    atomClass() {
      this.actionName = '';
      this.loadActionSelectOptions();
      this.loadAreaScopeSchema();
    },
  },
  methods: {
    onFormSubmit() {
      this.$refs.buttonSubmit.onClick();
    },
    onSelectAtomClass() {
      this.$view.navigate('/a/basefront/atom/selectAtomClass', {
        target: '_self',
        context: {
          params: {
            atomClass: this.atomClass,
            optional: true,
            inner: null,
            user: true,
          },
          callback: (code, data) => {
            if (code === 200) {
              this.atomClass = data;
            }
          },
        },
      });
    },
    onSelectScope() {
      this.$view.navigate('/a/baseadmin/role/select', {
        target: '_self',
        context: {
          params: {
            roleIdStart: null,
            multiple: true,
            roleTypes: [0, 1, 2, 3, 4],
          },
          callback: (code, roles) => {
            if (code === 200) {
              this.scope = roles;
            }
          },
        },
      });
    },
    async onSave() {
      const action = this.actionCurrent;
      if (!action) return;
      const data = {
        key: this.roleKey,
        atomClass: this.atomClass,
        actionCode: parseInt(action.code || action.action),
        scopeSelf: this.scopeSelf,
        scope: this.scope ? this.scope.map(item => item.itemId) : [],
      };
      if (this.areaScopeEnable) {
        const areaScopeMeta = this.areaScopeMeta;
        const areaKey = [];
        const areaScope = [];
        for (const key in areaScopeMeta.schemas) {
          areaKey.push(key);
          areaScope.push(this.areaScopeData[key]);
        }
        data.areaKey = areaKey;
        data.areaScope = areaScope;
      }
      await this.$api.post('atomRight/add', data);
      this.$meta.eventHub.$emit('atomRight:add', { roleId: this.roleId });
      this.$f7router.back();
    },
    loadAreaScopeSchema() {
      // always reset data
      this.areaScopeData = {};
      // schema
      const areaScopeMeta = this.areaScopeMeta;
      if (!areaScopeMeta) {
        this.areaScopeSchema = null;
      } else {
        this.areaScopeSchema = {
          module: areaScopeMeta.atomClass.module,
          schema: {
            type: 'object',
            properties: {
              ...areaScopeMeta.schemas,
            },
          },
        };
      }
    },
  },
};
