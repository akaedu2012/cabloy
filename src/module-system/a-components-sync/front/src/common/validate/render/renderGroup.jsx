export default {
  methods: {
    renderGroup(context) {
      const { parcel, key, property, dataPath } = context;
      const value = context.getValue();
      // parcel2
      const parcel2 = {
        data: value,
        dataSrc: parcel.dataSrc[key],
        schema: parcel.schema,
        properties: property.properties,
        pathParent: dataPath + '/',
      };
      // context2
      const context2 = {
        parcel: parcel2,
      };
      // children
      const children = this.renderProperties(context2);
      // group
      return this._renderGroupCommon(context, children);
    },
  },
};
