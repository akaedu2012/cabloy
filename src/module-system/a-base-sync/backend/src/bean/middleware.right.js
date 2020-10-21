// request.body
//   key: atomId itemId
//   atomClass: id,module,atomClassName,atomClassIdParent
//   item:
// options
//   type: atom/function
//   action(atom):
//   name(function):
//   module:
module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Middleware {
    async execute(options, next) {
      // ignore
      if (!options.type) return await next();

      // atom
      if (options.type === 'atom') await checkAtom(moduleInfo, options, ctx);

      // function
      if (options.type === 'function') await checkFunction(moduleInfo, options, ctx);

      // next
      await next();
    }
  }
  return Middleware;
};

async function checkAtom(moduleInfo, options, ctx) {
  // constant
  const constant = ctx.constant.module(moduleInfo.relativeName);

  // create
  if (options.action === constant.atom.action.create) {
    // atomClassId
    let atomClassId = ctx.request.body.atomClass.id;
    if (!atomClassId) {
      const res = await ctx.bean.atomClass.get({
        module: ctx.request.body.atomClass.module,
        atomClassName: ctx.request.body.atomClass.atomClassName,
        atomClassIdParent: ctx.request.body.atomClass.atomClassIdParent || 0,
      });
      atomClassId = res.id;
    }
    // roleIdOwner
    const roleIdOwner = ctx.request.body.roleIdOwner;
    if (roleIdOwner) {
      // check
      const res = await ctx.bean.atom.checkRightCreateRole({
        atomClass: {
          id: atomClassId,
        },
        roleIdOwner,
        user: ctx.state.user.op,
      });
      if (!res) ctx.throw(403);
      ctx.meta._atomClass = res;
    } else {
      // retrieve default one
      const roles = await ctx.bean.atom.preferredRoles({
        atomClass: {
          id: atomClassId,
        },
        user: ctx.state.user.op,
      });
      if (roles.length === 0) ctx.throw(403);
      ctx.request.body.roleIdOwner = roles[0].roleIdWho;
      ctx.meta._atomClass = { id: atomClassId };
    }
    return;
  }

  // read
  if (options.action === constant.atom.action.read) {
    const res = await ctx.bean.atom.checkRightRead({
      atom: { id: ctx.request.body.key.atomId },
      user: ctx.state.user.op,
    });
    if (!res) ctx.throw(403);
    ctx.request.body.key.itemId = res.itemId;
    ctx.meta._atom = res;
    return;
  }

  // write/delete
  if (options.action === constant.atom.action.write || options.action === constant.atom.action.delete) {
    const res = await ctx.bean.atom.checkRightAction({
      atom: { id: ctx.request.body.key.atomId, action: options.action, stage: options.stage },
      user: ctx.state.user.op,
    });
    if (!res) ctx.throw(403);
    ctx.request.body.key.itemId = res.itemId;
    ctx.meta._atom = res;
    return;
  }

  // other action
  const actionOther = options.action || ctx.request.body.action;
  const res = await ctx.bean.atom.checkRightAction({
    atom: { id: ctx.request.body.key.atomId, action: actionOther, stage: options.stage },
    user: ctx.state.user.op,
  });
  if (!res) ctx.throw(403);
  ctx.request.body.key.itemId = res.itemId;
  ctx.meta._atom = res;

}

async function checkFunction(moduleInfo, options, ctx) {
  if (ctx.innerAccess) return;
  const res = await ctx.bean.function.checkRightFunction({
    function: {
      module: options.module || ctx.module.info.relativeName,
      name: options.name || ctx.request.body.name },
    user: ctx.state.user.op,
  });
  if (!res) ctx.throw(403);
  ctx.meta._function = res;
}
