const mparse = require('egg-born-mparse').default;
const fse = require('fs-extra');
const path = require('path');
const URL = require('url').URL;
const isSafeDomainUtil = require('egg-security').utils.isSafeDomain;

module.exports = app => {
  return {
    lookupPackage(dir) {
      let _dir = dir;
      // eslint-disable-next-line
    while (true) {
        const file = path.join(_dir, 'package.json');
        if (file === '/package.json') return null;
        if (fse.existsSync(file)) return file;
        _dir = path.join(_dir, '../');
      }
    },
    combineFetchPath(moduleName, arg) {
      if (arg.substr(0, 2) === '//') return arg.substr(1);
      if (arg.charAt(0) === '/') return `/api${arg}`;
      const moduleInfo = typeof moduleName === 'string' ? mparse.parseInfo(moduleName) : moduleName;
      if (!moduleInfo) throw new Error('invalid url');
      return `/api/${moduleInfo.url}/${arg}`;
    },
    combineApiPath(moduleName, arg) {
      if (arg.charAt(0) === '/') return arg;
      const moduleInfo = typeof moduleName === 'string' ? mparse.parseInfo(moduleName) : moduleName;
      if (!moduleInfo) throw new Error('invalid url');
      return `/${moduleInfo.url}/${arg}`;
    },
    combineQueries(url, queries) {
      //
      if (!queries) return url;
      //
      let str = '';
      for (const key of Object.keys(queries)) {
        str += `${key}=${encodeURIComponent(queries[key])}&`;
      }
      if (str) {
        str = str.substr(0, str.length - 1);
      }
      if (!str) return url;
      //
      if (!url) return str;
      //
      const pos = url.indexOf('?');
      if (pos === -1) return `${url}?${str}`;
      if (pos === url.length - 1) return `${url}${str}`;
      return `${url}&${str}`;
    },
    createError(data, returnObject) {
      const error = returnObject ? {} : new Error();
      error.code = data.code || 500;
      error.message = data.message;
      if (data.stack) error.stack = data.stack;
      if (data.name) error.name = data.name;
      if (data.errno) error.errno = data.errno;
      if (data.sqlMessage) error.sqlMessage = data.sqlMessage;
      if (data.sqlState) error.sqlState = data.sqlState;
      if (data.index) error.index = data.index;
      if (data.sql) error.sql = data.sql;
      return error;
    },
    monkeyModule(ebModulesMonkey, monkeyName, monkeyData) {
      for (const key in ebModulesMonkey) {
        const moduleMonkey = ebModulesMonkey[key];
        if (moduleMonkey.main.monkey && moduleMonkey.main.monkey[monkeyName]) {
          moduleMonkey.main.monkey[monkeyName](monkeyData);
        }
      }
    },
    getWhiteListCors(ctx) {
      let whiteListCors;
      const _config = ctx.config.module('a-base');
      const _whiteList = (_config && _config.cors && _config.cors.whiteList) || [];
      if (!Array.isArray(_whiteList)) {
        whiteListCors = _whiteList.split(',');
      } else {
        whiteListCors = _whiteList.concat();
      }
      // inherits from jsonp
      let _whiteListJsonp = _config && _config.jsonp && _config.jsonp.whiteList;
      if (_whiteListJsonp) {
        if (!Array.isArray(_whiteListJsonp)) {
          _whiteListJsonp = _whiteListJsonp.split(',');
        }
        whiteListCors = whiteListCors.concat(_whiteListJsonp);
      }
      return whiteListCors;
    },
    isSafeDomain(ctx, origin) {
      // origin is {protocol}{hostname}{port}...
      if (!origin || origin === 'null' || origin === null) return true;

      let parsedUrl;
      try {
        parsedUrl = new URL(origin);
      } catch (err) {
        return false;
      }

      // whiteList
      const whiteListCors = this.getWhiteListCors(ctx);
      if (isSafeDomainUtil(parsedUrl.hostname, whiteListCors) || isSafeDomainUtil(origin, whiteListCors)) {
        return true;
      }
      return false;
    },
    compose(chains, adapter) {
      if (!chains) chains = [];
      return function(context, next) {
        // last called middleware #
        let index = -1;
        return dispatch(0);
        function dispatch(i) {
          if (i <= index) return new Error('next() called multiple times');
          index = i;
          let receiver;
          let fn;
          const chain = chains[i];
          if (chain) {
            const obj = adapter(context, chain);
            if (!obj) return dispatch(i + 1);
            receiver = obj.receiver;
            fn = obj.fn;
          }
          if (i === chains.length) fn = next;
          if (!fn) return;
          return fn.call(receiver, context, function next() {
            return dispatch(i + 1);
          });
        }
      };
    },
    composeAsync(chains, adapter) {
      if (!chains) chains = [];
      return function(context, next) {
      // last called middleware #
        let index = -1;
        return dispatch(0);
        function dispatch(i) {
          if (i <= index) return Promise.reject(new Error('next() called multiple times'));
          index = i;
          let receiver;
          let fn;
          const chain = chains[i];
          if (chain) {
            const obj = adapter(context, chain);
            if (!obj) return dispatch(i + 1);
            receiver = obj.receiver;
            fn = obj.fn;
          }
          if (i === chains.length) fn = next;
          if (!fn) return Promise.resolve();
          try {
            return Promise.resolve(fn.call(receiver, context, function next() {
              return dispatch(i + 1);
            }));
          } catch (err) {
            return Promise.reject(err);
          }
        }
      };
    },
    async createAnonymousContext({ locale, subdomain, module }) {
      // url
      const url = this.combineFetchPath(module, '');
      // ctx
      const ctx = app.createAnonymousContext({
        method: 'post',
        url,
      });
      // locale
      Object.defineProperty(ctx, 'locale', {
        get() {
          return locale || app.config.i18n.defaultLocale;
        },
      });
      // subdomain
      Object.defineProperty(ctx, 'subdomain', {
        get() {
          return subdomain;
        },
      });
      // instance
      if (subdomain !== undefined) {
        ctx.instance = await ctx.bean.instance.get({ subdomain });
      }
      // ok
      return ctx;
    },
    async executeBean({ locale, subdomain, context, beanModule, beanFullName, transaction, fn, ctxCaller }) {
      // ctx
      const ctx = await this.createAnonymousContext({ locale, subdomain, module: beanModule });
      // ctxCaller
      if (ctxCaller) {
        // multipart
        ctx.multipart = function(options) {
          return ctxCaller.multipart(options);
        };
        // cookies
        delegateCookies(ctx, ctxCaller);
        // ctxCaller
        ctx.ctxCaller = ctxCaller;
      }
      // bean
      const bean = beanFullName ? ctx.bean._getBean(beanFullName) : null;
      // execute
      if (transaction) {
        return await ctx.transaction.begin(async () => {
          return await this._executeBeanFn({ fn, ctx, bean, context });
        });
      }
      return await this._executeBeanFn({ fn, ctx, bean, context });
    },
    async _executeBeanFn({ fn, ctx, bean, context }) {
      if (fn) {
        return await fn({ ctx, bean, context });
      }
      return await bean.execute(context);
    },
    // async executeBeanInstance({ locale, context, beanModule, beanFullName, transaction, instance }) {
    //   // not check instance
    //   if (!instance) {
    //     return await this.executeBean({
    //       locale, context, beanModule, beanFullName, transaction,
    //     });
    //   }
    //   // all instances
    //   const ctx = await this.createAnonymousContext({ module: beanModule });
    //   const instances = await ctx.bean.instance.list();
    //   for (const instance of instances) {
    //     await this.executeBean({
    //       locale, subdomain: instance.name, context,
    //       beanModule, beanFullName, transaction,
    //     });
    //   }
    // },
  };
};

function delegateCookies(ctx, ctxCaller) {
  Object.defineProperty(ctx, 'cookies', {
    get() {
      return ctxCaller.cookies;
    },
  });
}
