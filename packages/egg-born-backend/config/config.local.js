const path = require('path');
const glob = require('glob');

module.exports = appInfo => {
  const config = {};

  // proxy
  config.proxy = true;
  config.ipHeaders = 'x-real-ip,x-forwarded-for';

  // queue
  config.queue = {
    redlock: {
      options: {
        lockTTL: 8 * 1000,
      },
    },
  };

  // mysql
  config.mysql = {
    clients: {
      // donnot change the name
      __ebdb: {
        hook: {
          meta: {
            long_query_time: 0,
          },
        },
      },
    },
  };

  // add http_proxy to httpclient
  if (process.env.http_proxy) {
    config.httpclient = {
      request: {
        enableProxy: true,
        rejectUnauthorized: false,
        proxy: process.env.http_proxy,
      },
    };
  }

  // development
  let watchDirs = glob
    .sync(`${path.join(appInfo.baseDir, '..')}/*/*/backend/src`)
    .map(file => '../' + file.substr(path.join(appInfo.baseDir, '../').length));
  watchDirs = ['config', 'mocks', 'mocks_proxy', 'app.js'].concat(watchDirs);

  config.development = {
    overrideDefault: true,
    watchDirs,
  };

  return config;
};
