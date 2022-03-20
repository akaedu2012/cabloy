const strategy = require('./strategy-wxwork.js');
const WxworkHelperFn = require('../../common/wxworkHelper.js');
const authProviderScenes = require('../../common/authProviderScenes.js');

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);

  function _createProvider(sceneInfo) {
    const config = ctx.config.module(moduleInfo.relativeName).account.wxwork;
    if (!config.corpid || !config.apps.selfBuilt.agentid) return null;
    return {
      meta: {
        title: sceneInfo.title,
        mode: 'redirect',
        disableAssociate: sceneInfo.disableAssociate,
        component: `button${sceneInfo.authProvider}`,
      },
      config: {
        client: sceneInfo.client,
        scope: 'snsapi_base',
      },
      configFunctions: {
        getConfig(ctx) {
          const config = ctx.config.module(moduleInfo.relativeName).account.wxwork;
          return { corpid: config.corpid, agentid: config.apps.selfBuilt.agentid };
        },
      },
      handler: app => {
        return {
          strategy,
          callback: (req, code, done) => {
            // ctx/state
            const ctx = req.ctx;
            const state = ctx.request.query.state || 'login';
            // code/memberId
            const wxworkHelper = new (WxworkHelperFn(ctx))();
            ctx.bean.wxwork.app.selfBuilt
              .getUserIdByCode(code)
              .then(res => {
                if (res.errcode) throw new Error(res.errmsg);
                const memberId = res.UserId;
                wxworkHelper
                  .verifyAuthUser({
                    scene: sceneInfo.scene,
                    memberId,
                    state,
                    needLogin: false,
                  })
                  .then(verifyUser => {
                    done(null, verifyUser);
                  })
                  .catch(done);
              })
              .catch(done);
          },
        };
      },
    };
  }

  function _createProviderMini(sceneInfo, sceneShort) {
    const config = ctx.config.module(moduleInfo.relativeName).account.wxwork.minis[sceneShort];
    if (!config.appID || !config.appSecret) return null;
    return {
      meta: {
        title: sceneInfo.title,
        mode: 'direct',
        disableAssociate: true,
      },
      config: {},
      handler: null,
    };
  }

  const metaAuth = {
    providers: {},
  };

  // wxwork/wxworkweb
  for (const scene of ['wxwork', 'wxworkweb']) {
    const sceneInfo = authProviderScenes.getScene(scene);
    metaAuth.providers[sceneInfo.authProvider] = _createProvider(sceneInfo);
  }

  // minis
  const minis = ctx.config.module(moduleInfo.relativeName).account.wxwork.minis;
  for (const sceneShort in minis) {
    const scene = `wxworkmini${sceneShort}`;
    const sceneInfo = authProviderScenes.getScene(scene);
    metaAuth.providers[sceneInfo.authProvider] = _createProviderMini(sceneInfo, sceneShort);
  }

  // ok
  return metaAuth;
};
