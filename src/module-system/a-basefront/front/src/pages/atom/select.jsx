import Vue from 'vue';
const ebPageContext = Vue.prototype.$meta.module.get('a-components').options.mixins.ebPageContext;
import listLayoutManager from '../../common/listLayoutManager/index.jsx';
export default {
  mixins: [ ebPageContext, listLayoutManager ],
  data() {
    return {
      container: {
        atomClass: null,
        options: null,
        params: null,
        scene: 'select',
        layout: 'select',
      },
    };
  },
  created() {
    // pageContext
    const contextParams = this.contextParams;
    // atomClass
    this.container.atomClass = contextParams.atomClass;
    // options
    this.container.options = contextParams.options;
    // params
    const selectMode = contextParams.selectMode;
    // params
    let selectedAtomIds;
    if (contextParams.selectMode === 'single') {
      selectedAtomIds = contextParams.selectedAtomId ? [ contextParams.selectedAtomId ] : [];
    } else {
      selectedAtomIds = contextParams.selectedAtomIds ? contextParams.selectedAtomIds.concat() : [];
    }
    this.container.params = {
      selectMode,
      selectedAtomIds,
    };
    // special for selectMode=single
    if (contextParams.selectMode === 'single') {
      this.container.scene = 'selecting';
      this.container.layout = 'selecting';
    }
  },
  render() {
    return (
      <eb-page
        ptr onPtrRefresh={this.page_onRefresh}
        infinite infinitePreloader={false} onInfinite={this.page_onInfinite}>
        <eb-navbar title={this.page_getTitle()} eb-back-link="Back">
          {this.layout_renderBlock({ blockName: 'title' })}
        </eb-navbar>
        {this.layout_renderLayout()}
      </eb-page>
    );
  },
};
