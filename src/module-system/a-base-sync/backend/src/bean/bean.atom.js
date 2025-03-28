const atom_0 = require('./bean.atom/bean.atom_0.js');
const atom_1 = require('./bean.atom/bean.atom_1.js');
const atom_right = require('./bean.atom/bean.atom_right.js');
const atom_starLabel = require('./bean.atom/bean.atom_starLabel.js');
const atom_areaScope = require('./bean.atom/bean.atom_areaScope.js');
const atom_draft = require('./bean.atom/bean.atom_draft.js');
const atom_formal = require('./bean.atom/bean.atom_formal.js');
const atom_simple = require('./bean.atom/bean.atom_simple.js');
const atom_submit = require('./bean.atom/bean.atom_submit.js');

module.exports = ctx => {
  return ctx.app.meta.util.mixinClasses(
    atom_0,
    [
      //
      atom_1,
      atom_right,
      atom_starLabel,
      atom_areaScope,
      atom_draft,
      atom_formal,
      atom_simple,
      atom_submit,
    ],
    ctx
  );
};
