import validateActionModule from './validateActionModule.js';
import validateComputedValue from './validateComputedValue.js';
import validateComputedDisplay from './validateComputedDisplay.js';
import renderSearchStates from './render/renderSearchStates.jsx';
import renderProperties from './render/renderProperties.jsx';
import renderComponent from './render/renderComponent.jsx';
import renderComponentAction from './render/renderComponentAction.jsx';
import renderGroup from './render/renderGroup.jsx';
import renderGroupEmpty from './render/renderGroupEmpty.jsx';
import renderGroupFlatten from './render/renderGroupFlatten.jsx';
import renderPanel from './render/renderPanel.jsx';
import renderText from './render/renderText.jsx';
import renderColorPicker from './render/renderColorPicker.jsx';
import renderDatePicker from './render/renderDatePicker.jsx';
import renderDateRange from './render/renderDateRange.jsx';
import renderFile from './render/renderFile.jsx';
import renderImage from './render/renderImage.jsx';
import renderToggle from './render/renderToggle.jsx';
import renderSelect from './render/renderSelect.jsx';
import renderButton from './render/renderButton.jsx';
import renderLink from './render/renderLink.jsx';
import renderLanguage from './render/renderLanguage.jsx';
import renderCategory from './render/renderCategory.jsx';
import renderTags from './render/renderTags.jsx';
import renderResourceType from './render/renderResourceType.jsx';
import renderJson from './render/renderJson.jsx';
import renderMarkdown from './render/renderMarkdown.jsx';
import renderDetails from './render/renderDetails.jsx';
import renderDetailsStat from './render/renderDetailsStat.jsx';
import renderDict from './render/renderDict.jsx';
import renderAtom from './render/renderAtom.jsx';
import renderAtomClass from './render/renderAtomClass.jsx';
import renderDivider from './render/renderDivider.jsx';
import renderUserLabel from './render/renderUserLabel.jsx';
import renderUserName from './render/renderUserName.jsx';
import renderUser from './render/renderUser.jsx';
import renderRole from './render/renderRole.jsx';

const __renderTypes = [
  ['group', 'renderGroup'],
  ['group-empty', 'renderGroupEmpty'],
  ['group-flatten', 'renderGroupFlatten'],
  ['panel', 'renderPanel'],
  ['text', 'renderText'],
  ['toggle', 'renderToggle'],
  ['select', 'renderSelect'],
  ['file', 'renderFile'],
  ['image', 'renderImage'],
  ['colorPicker', 'renderColorPicker'],
  ['datePicker', 'renderDatePicker'],
  ['dateRange', 'renderDateRange'],
  ['button', 'renderButton'],
  ['link', 'renderLink'],
  ['component', 'renderComponent'],
  ['component-action', 'renderComponentAction'],
  ['language', 'renderLanguage'],
  ['category', 'renderCategory'],
  ['tags', 'renderTags'],
  ['resourceType', 'renderResourceType'],
  ['json', 'renderJson'],
  ['markdown', 'renderMarkdown'],
  ['markdown-content', 'renderMarkdownContent'],
  ['markdown-content-cms', 'renderMarkdownContentCms'],
  ['details', 'renderDetails'],
  ['detailsStat', 'renderDetailsStat'],
  ['dict', 'renderDict'],
  ['atom', 'renderAtom'],
  ['atomClass', 'renderAtomClass'],
  ['divider', 'renderDivider'],
  ['userLabel', 'renderUserLabel'],
  ['userName', 'renderUserName'],
  ['user', 'renderUser'],
  ['role', 'renderRole'],
];

export default {
  mixins: [
    renderSearchStates,
    validateActionModule,
    validateComputedValue,
    validateComputedDisplay,
    renderProperties,
    renderComponent,
    renderComponentAction,
    renderGroup,
    renderGroupEmpty,
    renderGroupFlatten,
    renderPanel,
    renderText,
    renderColorPicker,
    renderDatePicker,
    renderDateRange,
    renderFile,
    renderImage,
    renderToggle,
    renderSelect,
    renderButton,
    renderLink,
    renderLanguage,
    renderCategory,
    renderTags,
    renderResourceType,
    renderJson,
    renderMarkdown,
    renderDetails,
    renderDetailsStat,
    renderDict,
    renderAtom,
    renderAtomClass,
    renderDivider,
    renderUserLabel,
    renderUserName,
    renderUser,
    renderRole,
  ],
  props: {
    parcel: {
      type: Object,
    },
    dataKey: {
      type: String,
    },
    property: {
      type: Object,
    },
    meta: {
      type: Object,
    },
    root: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      validate: null,
    };
  },
  watch: {
    parcel() {
      this.parcelChanged();
    },
  },
  created() {
    this.validate = this.getValidate();
  },
  beforeDestroy() {
    this.validate = null;
  },
  methods: {
    parcelChanged() {
      this.__computed_value_init();
      this.__computed_display_init();
    },
    getValidate() {
      let parent = this.$parent;
      while (parent) {
        if (parent.$options._componentTag === 'eb-validate') break;
        parent = parent.$parent;
      }
      return parent;
    },
    _handleComputedValue(parcel, key, property) {
      const ebComputed = property.ebComputed;
      if (!ebComputed) return;
      this.__computed_value.register({
        parcel,
        name: key,
        expression: ebComputed.expression,
        dependencies: ebComputed.dependencies,
        immediate: ebComputed.immediate,
      });
    },
    getValue(parcel, key) {
      if (!parcel.data) return undefined;
      const property = parcel.properties[key];
      const _value = parcel.data[key];
      if (!property) {
        return _value;
      }
      this._handleComputedValue(parcel, key, property);
      if (!this.checkIfNull(_value)) return _value;
      if (this.checkIfNull(property.default)) return _value;
      // #2025
      // // should change value so as to validate the default value
      // if (!this.validate.readOnly && !property.ebReadOnly) {
      //   this.$nextTick(() => {
      //     this.setValue(parcel, key, property.default);
      //   });
      // }
      return property.default;
    },
    setValue(parcel, key, value) {
      let property;
      if (parcel === this.parcel && key === this.dataKey && this.property) {
        property = this.property;
      } else {
        property = parcel.properties[key];
      }
      // typed value
      const _value = this._convertValueType(property, value);

      const _valueOld = parcel.data[key];

      this.$set(parcel.data, key, _value); // always set as maybe Object

      // dataSrc
      //   always set value for !property
      if (!property || property.type) {
        // change src
        this.$set(parcel.dataSrc, key, _value);
        // #2025
        // emit changed
        if (property && !property.ebReadOnly && !this._checkIfEqual(_valueOld, _value)) {
          this.$emit('change', _value);
          this.validate.$emit('validateItem:change', key, _value);
          this.validate.$emit('validateItemChange', key, _value);
        }
      }
    },
    _checkIfEqual(value1, value2) {
      if (value1 === value2) return true;
      if (!value1 || !value2) return false;
      // special for date
      if (value1 instanceof Date && value2 instanceof Date && value1.getTime() === value2.getTime()) return true;
      // others
      return false;
    },
    _convertValueType(property, value) {
      if (!property) return value;
      // special for select empty
      if ((property.ebType === 'select' || property.ebType === 'dict') && this.checkIfEmptyForSelect(value)) {
        return null; // for distinguish from 0
      }
      // special for null
      //   1. Number(null)=0
      //   2. input text, should hold the current input state when backspace all chars
      if (this.checkIfNull(value)) {
        return null;
      }
      // special for string
      //   1. input text, should hold the current input state when backspace all chars
      if (value === '') {
        return value;
      }
      // others
      let _value;
      if (property.type === 'number') {
        if (isNaN(value)) {
          _value = value;
        } else {
          _value = Number(value);
        }
      } else if (property.type === 'integer') {
        if (isNaN(value)) {
          _value = value;
        } else {
          _value = parseInt(Number(value));
        }
      } else if (property.type === 'boolean') {
        _value = Boolean(value);
      } else if (property.type === 'string') {
        _value = value === null ? null : String(value);
      } else {
        _value = value;
      }
      // ok
      return _value;
    },
    checkIfNull(value) {
      return value === undefined || value === null;
    },
    checkIfEmptyForSelect(value) {
      return value === '' || value === undefined || value === null;
    },
    adjustDataPath(dataPath) {
      if (!dataPath) return dataPath;
      if (dataPath[0] !== '/') return this.validate.dataPathRoot + dataPath;
      return dataPath;
    },
    getTitle(context, notHint) {
      const { property } = context;
      // not use 'key' as default title
      let title = property.ebTitle || '';
      if (title) {
        title = this.$text(title);
      }
      // ignore panel/group/toggle
      const ebType = property.ebType;
      if (ebType === 'panel' || ebType === 'group' || ebType === 'group-flatten' || ebType === 'toggle') return title;
      // only edit
      if (this.validate.readOnly || property.ebReadOnly) return title;
      // hint
      if (!notHint) {
        // config
        let hint = this.validate.host && this.validate.host.hint;
        if (!hint && hint !== false) {
          hint = this.$config.validate.hint;
        }
        if (hint === false) {
          return title;
        }
        const hintOptional = hint.optional;
        const hintMust = hint.must;
        // check optional
        if (hintOptional && !property.notEmpty) {
          return `${title}${this.$text(hintOptional)}`;
        }
        // check must
        if (hintMust && property.notEmpty) {
          return `${title}${this.$text(hintMust)}`;
        }
      }
      // default
      return title;
    },
    getPlaceholder(context) {
      const { property } = context;
      if (this.validate.readOnly || property.ebReadOnly) return undefined;
      return property.ebDescription ? this.$text(property.ebDescription) : this.getTitle(context, true);
    },
    getAtomId(context) {
      const { parcel, property } = context;
      // atomId: maybe from host
      let atomId = (this.validate.host && this.validate.host.atomId) || property.ebParams.atomId;
      if (typeof atomId === 'string') {
        atomId = parcel.data[atomId] || 0;
      } else {
        atomId = atomId || 0;
      }
    },
    onSubmit(event) {
      this.validate.onSubmit(event);
    },
    getParcel() {
      return this.parcel || this.validate.parcel;
    },
    _combinePropertyMeta({ property, meta, dataPath }) {
      const metaValidateProperty = this.$meta.util.getProperty(this.validate, `meta.properties.${dataPath}`);
      if (!metaValidateProperty && !meta) return property;
      return this.$meta.util.extend({}, property, metaValidateProperty, meta);
    },
    getContext({ parcel, key, property, meta, index, groupCount }) {
      // dataPath
      const dataPath = parcel.pathParent + key;
      // property
      property = this._combinePropertyMeta({ property, meta, dataPath });
      // patch getValue/setValue
      const patchGetValue = this.$meta.util.getProperty(property, 'ebPatch.getValue');
      const patchSetValue = this.$meta.util.getProperty(property, 'ebPatch.setValue');
      const patchGetValueGlobal = this.$meta.util.getProperty(this.validate, 'meta.ebPatch.getValue');
      const patchSetValueGlobal = this.$meta.util.getProperty(this.validate, 'meta.ebPatch.setValue');
      // context
      const context = {
        validate: this.validate,
        validateItem: this,
        parcel,
        key,
        property,
        dataPath,
        meta,
        index,
        groupCount,
        getTitle: notHint => {
          return this.getTitle(context, notHint);
        },
        getValue: name => {
          const propertyName = name || key;
          let value = this.getValue(parcel, propertyName);
          if (patchGetValue && (!name || name === key)) {
            // only patch this
            value = patchGetValue(value);
          }
          if (patchGetValueGlobal) {
            value = patchGetValueGlobal(value, propertyName);
          }
          return value;
        },
        setValue: (value, name) => {
          const propertyName = name || key;
          if (patchSetValueGlobal) {
            value = patchSetValueGlobal(value, propertyName);
          }
          if (patchSetValue && (!name || name === key)) {
            // only patch this
            value = patchSetValue(value);
          }
          this.setValue(parcel, propertyName, value);
        },
      };
      return context;
    },
    renderRoot() {
      if (!this.validate.ready) return <div></div>;
      // context
      const context = {
        parcel: this.getParcel(),
      };
      // renderProperties
      const children = this.renderProperties(context);
      const props = {
        form: true,
        noHairlinesMd: true,
        inlineLabels: !this.$config.form.floatingLabel,
      };
      return (
        <eb-list staticClass="eb-list-row" {...{ props }} onSubmit={this.onSubmit}>
          {children}
        </eb-list>
      );
    },
    renderItem() {
      if (!this.validate.ready) return <div></div>;
      // context
      const parcel = this.getParcel();
      const key = this.dataKey;
      const context = this.getContext({
        parcel,
        key,
        property: this.property || parcel.properties[key],
        meta: this.meta,
      });
      // renderItem
      return this._renderItem(context);
    },
    _renderItem(context) {
      const { parcel, key, property } = context;
      // ebType
      const ebType = property.ebType;
      // ignore if not specified
      if (!ebType) return null;
      // ebDisplay
      if (!this._handleComputedDisplay(parcel, key, property)) {
        // check group flatten
        if (property.ebType === 'group-flatten') {
          this._skipFlattenItems(context);
        }
        // null
        return null;
      }
      // render
      const renderType = __renderTypes.find(item => item[0].toUpperCase() === ebType.toUpperCase());
      if (!renderType) {
        // not support
        return <div>{`not support: ${ebType}`}</div>;
      }
      return this[renderType[1]](context);
    },
    _handleComputedDisplay(parcel, key, property) {
      // check if specify ebDisplay
      const ebDisplay = property.ebDisplay;
      if (!ebDisplay) return true;
      // check host.stage
      if (!this._handleComputedDisplay_checkHost(ebDisplay, 'stage')) {
        return false;
      }
      // check host.mode
      if (!this._handleComputedDisplay_checkHost(ebDisplay, 'mode')) {
        return false;
      }
      // check if specify expression
      if (!ebDisplay.expression) {
        return true;
      }
      // try to register always, for maybe disposed when parcel changed
      this.__computed_display.register({
        parcel,
        name: key,
        expression: ebDisplay.expression,
        dependencies: ebDisplay.dependencies,
        immediate: true, // always
      });
      // check current value
      return !!this.__computed_display_getValue(parcel, key);
    },
    _handleComputedDisplay_checkHost(ebDisplay, attr) {
      let hostAttr = ebDisplay.host && ebDisplay.host[attr];
      if (!hostAttr) return true;
      if (!Array.isArray(hostAttr)) {
        hostAttr = hostAttr.split(',');
      }
      const current = this.validate.host && this.validate.host[attr];
      return hostAttr.some(item => item === current);
    },
  },
};
