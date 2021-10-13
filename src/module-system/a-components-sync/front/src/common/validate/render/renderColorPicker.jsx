export default {
  methods: {
    renderColorPicker(context) {
      const { key, property, dataPath } = context;
      const title = this.getTitle(context);
      // value
      let value = context.getValue();
      if (!value || value.indexOf('#') === -1) {
        value = null;
      } else {
        value = { hex: value };
      }
      // render
      if (this.validate.readOnly || property.ebReadOnly) {
        const _value = value ? value.hex : '';
        const style = _value ? { color: _value } : null;
        return (
          <f7-list-item key={key} staticClass="">
            <div slot="title" staticClass={property.ebReadOnly ? 'text-color-gray' : ''}>
              {title}
            </div>
            <div slot="after" style={style}>
              {_value}
            </div>
          </f7-list-item>
        );
      }
      const placeholder = this.getPlaceholder(context);
      const info = property.ebHelp ? this.$text(property.ebHelp) : undefined;
      const colorPickerParams = this.$meta.util.extend(
        {
          formatValue: value => {
            if (value && value.hex) {
              return value.hex.toUpperCase();
            }
            return null;
          },
        },
        this.$config.colorPicker.params.default,
        property.ebParams
      );
      const props = {
        floatingLabel: this.$config.form.floatingLabel,
        type: 'colorpicker',
        placeholder,
        info,
        resizable: false,
        clearButton: !this.validate.readOnly && !property.ebReadOnly && !property.ebDisabled,
        dataPath,
        value,
        disabled: this.validate.readOnly || property.ebReadOnly || property.ebDisabled,
        colorPickerParams,
      };
      if (value) {
        props.inputStyle = {
          color: value.hex,
        };
      }
      // input
      return (
        <eb-list-input
          key={key}
          {...{ props }}
          onColorPickerChange={value => {
            // date or array of date
            context.setValue(value && value.hex ? value.hex.toUpperCase() : null);
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
