export default {
  meta: {
    global: false,
  },
  props: {
    layoutManager: {
      type: Object,
    },
    blockConfig: {
      type: Object,
    },
  },
  data() {
    return {
    };
  },
  created() {
  },
  methods: {
  },
  render() {
    return (
      <f7-nav-right>
        {this.layoutManager.base_renderFlowStatus()}
      </f7-nav-right>
    );
  },
};
