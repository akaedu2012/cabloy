const _sceneAll = 'wxwork,wxworkweb,wxworkmini';

module.exports = app => {
  const routes = [
    // test
    {
      method: 'post',
      path: 'test/getMemberId',
      controller: 'test',
      middlewares: 'inWxwork',
      meta: {
        inWxwork: {
          scene: _sceneAll,
        },
      },
    },
    {
      method: 'post',
      path: 'test/sendAppMessage',
      controller: 'test',
      middlewares: 'inWxwork',
      meta: {
        inWxwork: {
          scene: _sceneAll,
        },
      },
    },
  ];
  return routes;
};
