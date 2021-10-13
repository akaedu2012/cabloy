const utils = require('../../common/utils.js');

module.exports = {
  async: true,
  type: 'string',
  errors: true,
  compile() {
    return async function (data, path, rootData /* , name*/) {
      // ignore if empty
      if (!data) return true;
      const slug = data.trim();
      // unique slug for atomLanguage and atomClass
      const ctx = this;
      // validateHost
      if (!ctx.meta || !ctx.meta.validateHost) {
        // not check
        return true;
      }
      const atomId = ctx.meta.validateHost.key.atomId;
      const atomClass = ctx.meta.validateHost.atomClass;
      //   read by atomClass, atomLanguage, slug
      const items = await ctx.model.query(
        `
          select a.atomStage,a.id from aAtom a
            left join aCmsArticle b on a.id=b.atomId
              where a.atomStage in (0,1) and a.iid=? and a.deleted=0 and a.atomClassId=? and b.slug=? ${
                rootData.atomLanguage ? 'and a.atomLanguage=?' : ''
              }
          `,
        [ctx.instance.id, atomClass.id, slug, rootData.atomLanguage]
      );
      // check draft/formal
      const checkExists = await utils.checkAtomIdExists({ ctx, atomId, items });
      if (checkExists) {
        const errors = [{ keyword: 'x-slug', params: [], message: ctx.text('Slug Exists') }];
        throw new ctx.app.meta.ajv.ValidationError(errors);
      }
      return true;
    };
  },
};
