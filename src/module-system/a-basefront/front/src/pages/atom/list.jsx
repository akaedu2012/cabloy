import listLayoutManager from '../../common/listLayoutManager/index.jsx';
export default {
  mixins: [listLayoutManager],
  data() {
    const query = this.$f7route.query;
    const module = query && query.module;
    const atomClassName = query && query.atomClassName;
    const atomClass = module && atomClassName ? { module, atomClassName } : null;
    const options = query && query.options ? JSON.parse(query.options) : {};
    const params = query && query.params ? JSON.parse(query.params) : null;
    const scene = query && query.scene;
    const layout = query && query.layout;
    const resource = query && query.resource;
    // appLanguage
    if (query.appLanguage) {
      options.language = query.appLanguage;
    }
    return {
      container: {
        atomClass,
        options,
        params,
        scene,
        layout,
        resource,
      },
    };
  },
  render() {
    return this.layout_renderPage();
  },
};
