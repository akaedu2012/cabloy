const __itemBasicFields = ['id', 'iid', 'atomId', 'itemId', 'atomStage'];

module.exports = app => {
  // const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class AtomBase {
    async read({ atomClass, options, key, user }) {
      // get
      let item = await this.ctx.bean.atom._get({ atomClass, options, key, mode: 'full', user });
      if (!item) return item;
      // validate
      item = await this._readValidate({ atomClass, item, options, user });
      // atomClass
      const atomClassBase = await this.ctx.bean.atomClass.atomClass(atomClass);
      // dict translate
      await this._dictTranslate({ item, atomClassBase });
      // revision
      this._appendRevisionToHistory({ item });
      // flow
      if (item.flowNodeNameCurrent) {
        item.flowNodeNameCurrentLocale = this.ctx.text(item.flowNodeNameCurrent);
      }
      // atomLanguage
      if (item.atomLanguage) {
        item.atomLanguageLocale = this.ctx.text(item.atomLanguage);
      }
      // atomDisabled
      await this._atomDisabledTranslate({ atomClass, item });
      // atomState
      const atomState = item.atomState;
      if (atomState !== undefined && atomState !== null) {
        await this._atomStateTranslate({ item });
      }
      // userIds
      await this._userIdsTranslate({ item, atomClassBase });
      // ok
      return item;
    }

    async _readValidate({ atomClass, item, options, user }) {
      // schema
      const schema = options && options.schema;
      if (!schema) return item;
      // itemHold
      const itemHold = {};
      for (const field of __itemBasicFields) {
        if (item[field] !== undefined) {
          itemHold[field] = item[field];
        }
      }
      // itemBusiness
      const itemBusiness = {};
      for (const field of Object.keys(item)) {
        if (field === 'itemId') break;
        itemBusiness[field] = item[field];
        delete item[field];
      }
      // filterOptions
      const filterOptions = {
        ignoreRules: true,
      };
      await this.ctx.bean.validation._validate({ atomClass, data: itemBusiness, options, filterOptions });
      // assign
      item = Object.assign({}, itemHold, itemBusiness, item);
      return item;
    }
  }

  return AtomBase;
};
