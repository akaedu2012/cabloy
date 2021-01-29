module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Middleware {
    async execute(options, next) {
      // must exists
      const scene = options.scene;
      const scenes = options.scenes;
      if (!scene && !scenes) ctx.throw.module(moduleInfo.relativeName, 1001);

      // local.disabled
      if (ctx.app.meta.isLocal && ctx.config.module(moduleInfo.relativeName).configFront.local.disabled) {
        // next
        return await next();
      }

      try {
        // scene
        if (scene) {
          await sceneVerify({ ctx, scene });
        } else if (scenes) {
          for (const scene of scenes) {
            await sceneVerify({ ctx, scene });
          }
        }
        // next
        await next();
      } catch (e) {
        if (e.code !== 422) throw e;
        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = { code: 422, message: e.message };
      }
    }
  }
  return Middleware;
};

async function sceneVerify({ ctx, scene }) {
  // params
  const module = scene.module || ctx.module.info.relativeName;
  const sceneName = scene.name;
  const captchaData = ctx.request.body[scene.dataKey || 'captcha'];
  const providerInstanceId = captchaData.providerInstanceId;
  const dataInput = captchaData.data;
  // verify
  try {
    await ctx.bean.captcha.verify({ module, sceneName, providerInstanceId, dataInput });
  } catch (err) {
    throw combineCaptchaError({
      fieldKey: scene.fieldKey || 'token',
      message: err.message,
    });
  }
}

function combineCaptchaError({ fieldKey, message }) {
  // error
  const error = new Error();
  error.code = 422;
  error.message = [
    {
      keyword: 'x-captcha',
      params: [],
      message,
      dataPath: `/captcha/${fieldKey}`,
      schemaPath: `#/properties/captcha/${fieldKey}/x-captcha`,
    },
  ];
  return error;
}
