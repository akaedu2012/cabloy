const require3 = require('require3');
const uuid = require3('uuid');

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Auth extends app.Service {
    // mobile: not use
    async signup({ user, state = 'login', userName, realName, email, /* mobile,*/ password }) {
      // add authsimple
      const authSimpleId = await this._addAuthSimple({ password });

      // profileUser
      const profileUser = {
        module: moduleInfo.relativeName,
        provider: 'authsimple',
        profileId: authSimpleId,
        maxAge: 0,
        profile: {
          authSimpleId,
          rememberMe: false,
        },
      };

      // verify
      const verifyUser = await this.ctx.bean.user.verify({ state, profileUser });
      if (!verifyUser) this.ctx.throw(403);

      // userId
      const userId = verifyUser.agent.id;
      // remove old records
      await this.ctx.model.authSimple.delete({ userId });
      // update userId
      await this.ctx.model.authSimple.update({ id: authSimpleId, userId });

      // override user's info: userName/realName/email
      const userNew = { id: userId, realName };
      if (state === 'login' || !user.userName || user.userName.indexOf('__') > -1) {
        userNew.userName = userName;
      }
      await this.ctx.bean.user.save({
        user: userNew,
      });
      // save email
      if (email !== verifyUser.agent.email) {
        await this.ctx.bean.user.setActivated({
          user: { id: userId, email, emailConfirmed: 0 },
        });
      }

      // login now
      //   always no matter login/associate
      await this.ctx.login(verifyUser);

      // ok
      return verifyUser;
    }

    // data: { auth, password, rememberMe }
    async signin({ data, state = 'login' }) {
      const res = await this.ctx.bean.authProvider.authenticateIsolate({
        module: moduleInfo.relativeName,
        providerName: 'authsimple',
        ctxParent: {
          headers: this.ctx.headers,
          query: { state },
          body: { data },
        },
      });
      return res;
    }

    async _addAuthSimple({ password }) {
      // hash
      password = password || this.ctx.config.defaultPassword;
      const hash = await this.ctx.bean.local.simple.calcPassword({ password });
      // auth simple
      const res = await this.ctx.model.authSimple.insert({
        userId: 0,
        hash,
      });
      return res.insertId;
    }

    async add({ userId, password }) {
      // add authsimple
      const authSimpleId = await this._addAuthSimple({ password });
      // update userId
      await this.ctx.model.authSimple.update({ id: authSimpleId, userId });

      // auth
      const providerItem = await this.ctx.bean.authProvider.getAuthProvider({
        module: moduleInfo.relativeName,
        providerName: 'authsimple',
      });
      const modelAuth = this.ctx.model.module('a-base').auth;
      await modelAuth.insert({
        userId,
        providerId: providerItem.id,
        profileId: authSimpleId,
        profile: JSON.stringify({
          authSimpleId,
          rememberMe: false,
        }),
      });
    }

    async passwordChange({ passwordOld, passwordNew, userId }) {
      // verify old
      const authSimple = await this.ctx.bean.local.simple.verify({ userId, password: passwordOld });
      if (!authSimple) this.ctx.throw(403);
      // save new
      await this._passwordSaveNew({ passwordNew, userId });

      // profileUser
      const authSimpleId = authSimple.id;
      const profileUser = {
        module: moduleInfo.relativeName,
        provider: 'authsimple',
        profileId: authSimpleId,
        maxAge: 0,
        profile: {
          authSimpleId,
          rememberMe: false,
        },
      };

      // verify
      const verifyUser = await this.ctx.bean.user.verify({ state: 'associate', profileUser });
      if (!verifyUser) this.ctx.throw(403);

      // force kickout all login records
      await this.ctx.bean.userOnline.kickOut({ user: { id: userId } });

      // login now
      //   always no matter login/associate
      // await this.ctx.login(verifyUser);
    }

    async _passwordSaveNew({ passwordNew, userId }) {
      // save new
      const auth = await this.ctx.model.authSimple.get({
        userId,
      });
      const hash = await this.ctx.bean.local.simple.calcPassword({ password: passwordNew });
      await this.ctx.model.authSimple.update({
        id: auth.id,
        hash,
      });
    }

    async passwordReset({ passwordNew, token }) {
      // token value
      const cacheKey = `passwordReset:${token}`;
      const value = await this.ctx.cache.db.get(cacheKey);
      if (!value) {
        // expired, send confirmation mail again
        //  1003: passwordResetEmailExpired
        this.ctx.throw(1003);
      }
      // userId
      const userId = value.userId;

      // save new
      await this._passwordSaveNew({ passwordNew, userId });
      // clear token
      await this.ctx.cache.db.remove(cacheKey);
      // login antomatically
      const user = await this.ctx.bean.user.get({ id: userId });
      const data = { auth: user.email, password: passwordNew, rememberMe: false };
      const user2 = await this.signin({ data, state: 'login' });
      // ok
      return user2;
    }

    async passwordForgot({ email }) {
      // user by email
      const user = await this.ctx.bean.user.exists({ email });
      // link
      const token = uuid.v4().replace(/-/g, '');
      const link = this.ctx.bean.base.getAbsoluteUrl(`/#!/a/authsimple/passwordReset?token=${token}`);
      // config
      const configTemplate = this.ctx.config.email.templates.passwordReset;
      // email subject
      let subject = this.ctx.text(configTemplate.subject);
      subject = this.ctx.bean.util.replaceTemplate(subject, { siteName: this.ctx.instance.title });
      // email body
      let body = this.ctx.text(configTemplate.body);
      body = this.ctx.bean.util.replaceTemplate(body, {
        userName: user.userName,
        link,
        siteName: this.ctx.instance.title,
      });
      // send
      await this.ctx.bean.mail.send({
        scene: null, // use default
        message: {
          to: email,
          subject,
          text: body,
        },
      });
      // save
      await this.ctx.cache.db.set(`passwordReset:${token}`, { userId: user.id }, this.ctx.config.passwordReset.timeout);
    }

    async emailConfirm({ email, user }) {
      // save email
      await this.ctx.bean.user.setActivated({
        user: { id: user.id, email, emailConfirmed: 0 },
      });
      // link
      const token = uuid.v4().replace(/-/g, '');
      const link = this.ctx.bean.base.getAbsoluteUrl(`/api/a/authsimple/auth/emailConfirmation?token=${token}`);
      // config
      const configTemplate = this.ctx.config.email.templates.confirmation;
      // email subject
      let subject = this.ctx.text(configTemplate.subject);
      subject = this.ctx.bean.util.replaceTemplate(subject, { siteName: this.ctx.instance.title });
      // email body
      let body = this.ctx.text(configTemplate.body);
      body = this.ctx.bean.util.replaceTemplate(body, {
        userName: user.userName,
        link,
        siteName: this.ctx.instance.title,
      });
      // send
      await this.ctx.bean.mail.send({
        scene: null, // use default
        message: {
          to: email,
          subject,
          text: body,
        },
      });
      // save
      await this.ctx.cache.db.set(`emailConfirm:${token}`, { userId: user.id }, this.ctx.config.confirmation.timeout);
    }

    // invoke by user clicking the link
    async emailConfirmation({ token }) {
      // token value
      const cacheKey = `emailConfirm:${token}`;
      const value = await this.ctx.cache.db.get(cacheKey);
      if (!value) {
        // expired, send confirmation mail again
        const data = {
          message: this.ctx.text('confirmationEmailExpired'),
          link: '/a/authsimple/emailConfirm',
          linkText: this.ctx.text('Resend Confirmation Email'),
        };
        const url = this.ctx.bean.base.getAlertUrl({ data });
        return this.ctx.redirect(url);
      }
      // userId
      const userId = value.userId;
      // activated
      await this.ctx.bean.user.setActivated({
        user: { id: userId, emailConfirmed: 1 },
      });
      // clear token
      await this.ctx.cache.db.remove(cacheKey);
      // not: login antomatically
      // ok
      const data = {
        message: this.ctx.text('confirmationEmailSucceeded'),
        link: '#back',
        linkText: this.ctx.text('Close'),
      };
      const url = this.ctx.bean.base.getAlertUrl({ data });
      return this.ctx.redirect(url);
    }
  }

  return Auth;
};
