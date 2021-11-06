export default {
  props: {
    context: {
      type: Object,
    },
  },
  data() {
    return {};
  },
  created() {},
  methods: {
    async onChooseUser() {
      const { key, property } = this.context;
      // target
      let target = property.ebParams.target;
      if (target === undefined) target = '_self';
      // mapper
      const mapper = property.ebParams.mapper;
      return new Promise(resolve => {
        const url = '/a/baseadmin/user/select';
        this.$view.navigate(url, {
          target,
          context: {
            params: {
              buttonClearUser: true,
            },
            callback: (code, selectedUser) => {
              if (code === 200) {
                // mapper
                if (mapper) {
                  for (const key in mapper) {
                    const value = selectedUser[mapper[key]];
                    this.context.setValue(value, key);
                  }
                } else {
                  const value = selectedUser[key];
                  this.context.setValue(value, key);
                }
                resolve(true);
              } else if (code === false) {
                resolve(false);
              }
            },
          },
        });
      });
    },
  },
  render() {
    const { dataPath, property, validate } = this.context;
    const title = this.context.getTitle();
    const value = this.context.getValue();
    if (validate.readOnly || property.ebReadOnly) {
      return (
        <f7-list-item title={title}>
          <div slot="after">{value}</div>
        </f7-list-item>
      );
    }
    return (
      <eb-list-item-choose link="#" dataPath={dataPath} title={title} propsOnChoose={this.onChooseUser}>
        <div slot="after">{value}</div>
      </eb-list-item-choose>
    );
  },
};
