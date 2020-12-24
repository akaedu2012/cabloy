export default {
  data() {
    return {
      order: {
        selected: null,
      },
    };
  },
  computed: {
    order_current() {
      return this.order.selected || this.order_default();
    },
    order_list() {
      // base
      const ordersBase = this.base.configAtomBase.render.list.info.orders;
      // atomClass
      const ordersAtomClass = this.$meta.util.getProperty(this.base.configAtom, 'render.list.info.orders');
      // atomOrders
      return ordersAtomClass ? ordersBase.concat(ordersAtomClass) : ordersBase;
    },
  },
  methods: {
    order_default(params) {
      let atomOrder;
      if (!params) {
        params = this.base_prepareSelectParams({ setOrder: false });
      }
      if (this.container.scene === 'select') {
        atomOrder = {
          name: 'atomName',
          by: 'asc',
          tableAlias: 'a',
        };
      } else if (params.options.star) {
        atomOrder = {
          name: 'updatedAt',
          by: 'desc',
          tableAlias: 'd',
        };
      } else if (params.options.label) {
        atomOrder = {
          name: 'updatedAt',
          by: 'desc',
          tableAlias: 'e',
        };
      } else {
        // others
        atomOrder = {
          name: 'atomUpdatedAt',
          by: 'desc',
          tableAlias: '',
        };
      }
      // ok
      return atomOrder;
    },
    order_onPerformPopover(event) {
      const popover = this.$refs.order_popover.$el;
      this.$f7.popover.open(popover, event.currentTarget);
    },
    order_onPerformChange(event, atomOrder) {
      // switch
      const atomOrderCurrent = this.order_current;
      if (this.order_getKey(atomOrderCurrent) === this.order_getKey(atomOrder)) {
        this.order.selected = {
          name: atomOrderCurrent.name,
          tableAlias: atomOrderCurrent.tableAlias,
          by: atomOrderCurrent.by === 'desc' ? 'asc' : 'desc',
        };
      } else {
        this.order.selected = atomOrder;
      }
      // reload
      this.page_onRefresh();
    },
    order_getKey(atomOrder) {
      if (!atomOrder) return null;
      let orderName;
      if (atomOrder.tableAlias === '') {
        orderName = atomOrder.name;
      } else {
        orderName = `${atomOrder.tableAlias || 'f'}.${atomOrder.name}`;
      }
      return orderName;
    },
    order_getStatus(atomOrder) {
      const atomOrderCurrent = this.order_current;
      if (this.order_getKey(atomOrderCurrent) === this.order_getKey(atomOrder)) {
        return atomOrderCurrent.by === 'desc' ? 'arrow_drop_down' : 'arrow_drop_up';
      }
      return '';
    },
    order_renderAction() {
      return (
        <eb-link iconMaterial="sort" propsOnPerform={event => this.order_onPerformPopover(event)}></eb-link>
      );
    },
    order_renderPopover() {
      if (!this.base.ready) return null;
      // list
      const children = [];
      for (const atomOrder of this.order_list) {
        children.push(
          <eb-list-item key={this.order_getKey(atomOrder)} popoverClose link="#" propsOnPerform={event => this.order_onPerformChange(event, atomOrder)}>
            <f7-icon slot="media" material={this.order_getStatus(atomOrder)}></f7-icon>
            <div slot="title">{this.$text(atomOrder.title)}</div>
          </eb-list-item>
        );
      }
      return (
        <eb-popover ref="order_popover" ready={true}>
          <f7-list inset>
            {children}
          </f7-list>
        </eb-popover>
      );
    },
  },
};
