const require3 = require('require3');
const uuid = require3('uuid');
const extend = require3('extend2');

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);

  class Auth {
    constructor() {
      this._redisAuth = null;
    }

    get redisAuth() {
      if (!this._redisAuth) {
        this._redisAuth = ctx.app.redis.get('auth') || ctx.app.redis.get('cache');
      }
      return this._redisAuth;
    }

    // return current user auth info
    //   { op:{id},agent:{id},provider}
    async echo() {
      try {
        // check
        await ctx.bean.user.check();
        // logined
        return await this.getLoginInfo({ clientId: true });
      } catch (e) {
        // deleted,disabled
        return await this.logout();
      }
    }

    async check() {
      return await this.getLoginInfo();
    }

    async logout() {
      const user = ctx.state.user;
      await this._sendMessageSystemLogout({ user });
      await this._clearRedisAuth({ user });
      await ctx.logout();
      await ctx.bean.user.loginAsAnonymous();
      return await this.getLoginInfo();
    }

    async getLoginInfo(options) {
      options = options || {};
      // config
      const config = await this._getConfig();
      const info = {
        user: ctx.state.user,
        instance: this._getInstance(),
        config,
      };
      // clientId
      if (options.clientId === true) {
        info.clientId = uuid.v4().replace(/-/g, '');
      }
      // login info event
      await ctx.bean.event.invoke({
        name: 'loginInfo',
        data: { info },
      });
      return info;
    }

    _getInstance() {
      return {
        name: ctx.instance.name,
        title: ctx.instance.title,
      };
    }

    async _getConfig() {
      // instanceConfigsFront
      const instanceConfigsFront = ctx.bean.instance.getInstanceConfigsFront();
      // config
      let config = {
        modules: instanceConfigsFront,
      };
      // config base
      config = extend(true, config, {
        modules: {
          'a-base': {
            account: this._getAccount(),
          },
        },
      });
      // theme
      const themeStatus = `user-theme:${ctx.state.user.agent.id}`;
      const theme = await ctx.bean.status.module('a-user').get(themeStatus);
      if (theme) {
        config.theme = theme;
      }
      // localeModules
      config.localeModules = ctx.bean.base.localeModules();
      // ok
      return config;
    }

    _getAccount() {
      // account
      const account = extend(true, {}, ctx.config.module(moduleInfo.relativeName).account);
      account.activatedRoles = undefined;
      // url
      for (const key in account.activationProviders) {
        const relativeName = account.activationProviders[key];
        if (relativeName) {
          const moduleConfig = ctx.config.module(relativeName);
          extend(true, account.url, moduleConfig.account.url);
        }
      }
      return account;
    }

    _getAuthRedisKey({ user }) {
      const userAgent = user.agent || user.op;
      return `authToken:${ctx.instance.id}:${userAgent.id}:${user.provider.scene || ''}:${user.provider.id}`;
    }

    _getAuthRedisKeyPattern({ user, keyPrefix }) {
      return `${keyPrefix}authToken:${ctx.instance.id}:${user.id}:*`;
    }

    async serializeUser({ user }) {
      // _user
      const _user = {
        op: { id: user.op.id, iid: user.op.iid, anonymous: user.op.anonymous },
        provider: user.provider,
      };
      if (user.agent.id !== user.op.id) {
        _user.agent = { id: user.agent.id, iid: user.agent.iid, anonymous: user.agent.anonymous };
      }
      // anonymous
      if (user.op.anonymous) {
        // not use redis
        return _user;
      }
      // save to redis
      const key = this._getAuthRedisKey({ user });
      if (!ctx.bean.util.checkDemo(false)) {
        // demo, allowed to auth more times
        _user.token = await this.redisAuth.get(key);
      } else {
        // create a new one
        _user.token = null;
      }
      if (!_user.token) {
        _user.token = uuid.v4().replace(/-/g, '');
      }
      await this.redisAuth.set(key, _user.token, 'PX', ctx.session.maxAge);
      // register user online
      await ctx.bean.userOnline.register({ user, isLogin: true });
      // ok
      return _user;
    }

    async deserializeUser({ user }) {
      if (user.op.anonymous) return user;
      // not throw 401: ctx.throw(401);
      if (!user.token) return null;
      // check token
      const key = this._getAuthRedisKey({ user });
      const token = await this.redisAuth.get(key);
      if (token !== user.token) return null;
      // ready
      return user;
    }

    async _sendMessageSystemLogout({ user }) {
      if (!user || user.op.anonymous) return;
      // send message-system
      await ctx.bean.userOnline.sendMessageSystemLogout({
        user: user.op, // should use user.op
        type: 'provider',
        provider: user.provider,
      });
    }

    async _clearRedisAuth({ user }) {
      if (!user || user.agent.anonymous) return;
      // redis auth
      const key = this._getAuthRedisKey({ user });
      await this.redisAuth.del(key);
    }

    async _clearRedisAuthAll({ user }) {
      const keyPrefix = this.redisAuth.options.keyPrefix;
      const keyPattern = this._getAuthRedisKeyPattern({ user, keyPrefix });
      const keys = await this.redisAuth.keys(keyPattern);
      for (const fullKey of keys) {
        const key = keyPrefix ? fullKey.substr(keyPrefix.length) : fullKey;
        await this.redisAuth.del(key);
      }
    }
  }

  return Auth;
};
