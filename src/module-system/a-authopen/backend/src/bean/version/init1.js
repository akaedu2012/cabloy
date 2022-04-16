const os = require('os');
const path = require('path');
const require3 = require('require3');
const fse = require3('fs-extra');
const chalk = require3('chalk');
const initData = require('./initData1.js');

module.exports = function (ctx) {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const __atomClassRole = {
    module: 'a-base',
    atomClassName: 'role',
  };
  const __atomClassAuthOpen = {
    module: moduleInfo.relativeName,
    atomClassName: 'authOpen',
  };
  class VersionInit {
    get modelAuthOpen() {
      return ctx.model.module(moduleInfo.relativeName).authOpen;
    }

    async run(options) {
      // rights
      await this._init_rights();
      // open auth scopes
      await this._init_roleScopes();
      // RoleScopeCliDevelopment
      await this._init_rootCliDevTest();
    }

    async _init_rights() {
      // add role rights
      const roleRights = [
        { roleName: 'authenticated', action: 'create' },
        { roleName: 'authenticated', action: 'read', scopeNames: 0 },
        { roleName: 'authenticated', action: 'write', scopeNames: 0 },
        { roleName: 'authenticated', action: 'delete', scopeNames: 0 },
        { roleName: 'authenticated', action: 'hideClientSecret', scopeNames: 0 },
        { roleName: 'authenticated', action: 'resetClientSecret', scopeNames: 0 },
        { roleName: 'authenticated', action: 'deleteBulk' },
        { roleName: 'system', action: 'read', scopeNames: 'authenticated' },
      ];
      await ctx.bean.role.addRoleRightBatch({ atomClassName: 'authOpen', roleRights });
    }

    async _init_roleScopes() {
      for (const roleScope of initData.roleScopes) {
        // item
        const item = { ...roleScope };
        // roleIdParent
        const role = await ctx.bean.role.parseRoleName({ roleName: roleScope.roleIdParent });
        item.roleIdParent = role.id;
        // loadAtomStatic
        const atomKey = await ctx.bean.atomStatic.loadAtomStatic({
          moduleName: moduleInfo.relativeName,
          atomClass: __atomClassRole,
          item,
        });
        if (atomKey && roleScope._roleRights) {
          // role rights
          const roleRights = [{ roleName: roleScope._roleRights, action: 'read', scopeNames: [atomKey.itemId] }];
          await ctx.bean.role.addRoleRightBatch({
            module: 'a-base',
            atomClassName: 'role',
            roleRights,
          });
        }
      }
      await ctx.bean.role.setDirty(true);
    }

    async _init_rootCliDevTest() {
      // only for test/local env
      if (ctx.app.meta.isProd) return;
      // create
      const authOpenKey = await this._init_rootCliDevTest_create();
      // persistence
      await this._init_rootCliDevTest_persistence({ authOpenKey });
    }

    async _init_rootCliDevTest_create() {
      // create aAuthOpen record for user:root
      const userRoot = await ctx.bean.user.get({ userName: 'root' });
      const authOpenKey = await ctx.bean.atom.create({
        atomClass: __atomClassAuthOpen,
        user: userRoot,
      });
      // write
      const scopeRole = await ctx.bean.role.parseRoleName({ roleName: 'RoleScopeCliDevelopment' });
      const item = {
        atomName: 'Cli For Development',
        scopeRoleId: scopeRole.id,
        neverExpire: 1,
        expireTime: null,
      };
      await ctx.bean.atom.write({
        key: authOpenKey,
        item,
        user: userRoot,
      });
      // submit
      await ctx.bean.atom.submit({
        key: authOpenKey,
        options: { ignoreFlow: true },
        user: userRoot,
      });
      // hidden
      await this.modelAuthOpen.update({
        id: authOpenKey.itemId,
        userId: userRoot.id,
        clientSecretHidden: 1,
      });
      // ok
      return authOpenKey;
    }

    async _init_rootCliDevTest_persistence({ authOpenKey }) {
      // authOpen
      const item = await this.modelAuthOpen.get({ id: authOpenKey.itemId });
      // init file
      const { fileName, config } = await this._readCabloyInitFile();
      // backend port
      const buildConfig = require3(path.join(process.cwd(), 'build/config.js'));
      const port = buildConfig.backend.port;
      // token name
      const tokenName = `clidev@${ctx.app.name}`;
      // config
      if (!config.tokens) config.tokens = {};
      config.tokens[tokenName] = {
        host: `http://localhost:${port}`,
        clientID: item.clientID,
        clientSecret: item.clientSecret,
      };
      // save
      await fse.outputFile(fileName, JSON.stringify(config, null, 2));
    }

    async _readCabloyInitFile() {
      // fileName
      const fileName = path.join(os.homedir(), '.cabloy', 'openauth.json');
      // config
      let config;
      const exists = await fse.pathExists(fileName);
      if (!exists) {
        config = {};
      } else {
        const content = await fse.readFile(fileName);
        config = JSON.parse(content);
      }
      // chalk
      console.log(chalk.cyan(`\n  ${fileName}\n`));
      // ok
      return { fileName, config };
    }
  }
  return VersionInit;
};
