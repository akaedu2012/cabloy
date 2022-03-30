// Deprecate: ebCurrency\ebLocale\ebDateFormat\ebTextarea\ebSecure\ebInputType
export default {
  methods: {
    _formatValueCurrency(value) {
      if (isNaN(value)) return value;
      return (Number(value) / 100).toFixed(2);
    },
    _updateValueCurrency(value) {
      if (isNaN(value)) return value;
      return Number((Number(value) * 100).toFixed(0));
    },
    _formatTextGeneral(property, value) {
      if (this.checkIfEmptyForSelect(value)) return value;
      // currency
      const ebCurrency = this.$meta.util.getPropertyDeprecate(property, 'ebParams.currency', 'ebCurrency');
      if (ebCurrency) {
        value = this._formatValueCurrency(value);
      }
      // locale
      const ebLocale = this.$meta.util.getPropertyDeprecate(property, 'ebParams.locale', 'ebLocale');
      if (ebLocale) {
        value = this.$text(value);
      }
      // date
      const ebDateFormat = this.$meta.util.getPropertyDeprecate(property, 'ebParams.dateFormat', 'ebDateFormat');
      if (ebDateFormat) {
        value = this.$meta.util.formatDateTime(value, ebDateFormat);
      }
      return value;
    },
    renderText(context) {
      const { key, property, dataPath } = context;
      const title = this.getTitle(context);
      let value = context.getValue();
      // params
      const ebCurrency = this.$meta.util.getPropertyDeprecate(property, 'ebParams.currency', 'ebCurrency');
      const ebTextarea = this.$meta.util.getPropertyDeprecate(property, 'ebParams.textarea', 'ebTextarea');
      const ebSecure = this.$meta.util.getPropertyDeprecate(property, 'ebParams.secure', 'ebSecure');
      const ebInputType = this.$meta.util.getPropertyDeprecate(property, 'ebParams.inputType', 'ebInputType');
      const ebImmediate = this.$meta.util.getPropertyDeprecate(property, 'ebParams.immediate', 'ebImmediate');
      const immediate = ebImmediate !== false && !ebCurrency;
      // format
      value = this._formatTextGeneral(property, value);
      // render
      if ((this.validate.readOnly || property.ebReadOnly) && !ebTextarea) {
        return (
          <f7-list-item key={key} staticClass="" after={String(value)}>
            <div slot="title" staticClass={property.ebReadOnly ? 'text-color-gray' : ''}>
              {title}
            </div>
          </f7-list-item>
        );
      }
      const placeholder = this.getPlaceholder(context);
      const info = property.ebHelp ? this.$text(property.ebHelp) : undefined;
      let type;
      if (ebSecure) {
        type = 'password';
      } else if (ebTextarea) {
        type = 'textarea';
      } else if (ebInputType) {
        type = ebInputType;
      } else {
        type = 'text';
      }
      // props
      const props = {
        floatingLabel: this.$config.form.floatingLabel,
        type,
        placeholder,
        info,
        resizable: ebTextarea,
        clearButton: !this.validate.readOnly && !property.ebReadOnly && !property.ebDisabled,
        dataPath,
        value,
        disabled: this.validate.readOnly || property.ebReadOnly || property.ebDisabled,
      };
      return (
        <eb-list-input
          key={key}
          {...{ props }}
          onInput={valueNew => {
            if (immediate) {
              context.setValue(valueNew);
            }
          }}
          onChange={valueNew => {
            if (!immediate) {
              valueNew = this._updateValueCurrency(valueNew);
              context.setValue(valueNew);
            }
          }}
        >
          <div slot="label" staticClass={property.ebReadOnly ? 'text-color-gray' : ''}>
            {title}
          </div>
          {this.__searchStates_render_list_item(context)}
        </eb-list-input>
      );
    },
  },
};
