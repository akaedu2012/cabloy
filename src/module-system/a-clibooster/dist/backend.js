/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 224:
/***/ ((module) => {

module.exports = app => {
  const aops = {};
  return aops;
};


/***/ }),

/***/ 511:
/***/ ((module) => {

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Cli extends ctx.app.meta.CliBase(ctx) {
    async execute({ user }) {
      const { argv } = this.context;
      // super
      await super.execute({ user });
      // module name/info
      const moduleName = argv.module;
      argv.moduleInfo = this.helper.parseModuleInfo(moduleName);
      // check if exists
      const _module = this.helper.findModule(moduleName);
      if (!_module) {
        throw new Error(`module does not exist: ${moduleName}`);
      }
      // target dir
      const targetDir = await this.helper.ensureDir(_module.root);
      // render
      await this.template.renderBoilerplateAndSnippets({
        targetDir,
        moduleName: moduleInfo.relativeName,
        snippetsPath: 'create/atom/snippets',
        boilerplatePath: 'create/atom/boilerplate',
      });
      // reload
      ctx.app.meta.reload.now();
    }
  }

  return Cli;
};


/***/ }),

/***/ 199:
/***/ ((module) => {

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Cli extends ctx.app.meta.CliBase(ctx) {
    async execute({ user }) {
      const { argv } = this.context;
      // super
      await super.execute({ user });
      // module name/info
      const moduleName = argv.module;
      argv.moduleInfo = this.helper.parseModuleInfo(moduleName);
      // check if exists
      const _module = this.helper.findModule(moduleName);
      if (!_module) {
        throw new Error(`module does not exist: ${moduleName}`);
      }
      // target dir
      const targetDir = await this.helper.ensureDir(_module.root);
      // render
      await this.template.renderBoilerplateAndSnippets({
        targetDir,
        moduleName: moduleInfo.relativeName,
        snippetsPath: 'create/controller/snippets',
        boilerplatePath: 'create/controller/boilerplate',
      });
      // reload
      ctx.app.meta.reload.now();
    }
  }

  return Cli;
};


/***/ }),

/***/ 554:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const fs = __webpack_require__(147);
const path = __webpack_require__(17);

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Cli extends ctx.app.meta.CliBase(ctx) {
    async execute({ user }) {
      const { argv } = this.context;
      // super
      await super.execute({ user });
      // suite name/info
      const suiteName = argv.suite;
      if (suiteName) {
        argv.suiteInfo = this.helper.parseSuiteInfo(suiteName);
        // check if exists
        argv._suite = this.helper.findSuite(suiteName);
        if (!argv._suite) {
          throw new Error(`suite does not exist: ${suiteName}`);
        }
      }
      // module name/info
      const moduleName = argv.name;
      argv.moduleInfo = this.helper.parseModuleInfo(moduleName);
      // check if exists
      const _module = this.helper.findModule(moduleName);
      if (!argv.force && _module) {
        throw new Error(`module exists: ${moduleName}`);
      }
      // target dir
      let targetDir;
      if (suiteName) {
        targetDir = path.join(argv._suite.root, 'modules', moduleName);
      } else {
        targetDir = path.join(argv.projectPath, 'src/module', moduleName);
      }
      if (!argv.force && fs.existsSync(targetDir)) {
        throw new Error(`module exists: ${moduleName}`);
      }
      targetDir = await this.helper.ensureDir(targetDir);
      // template
      const template = argv.template;
      // templateDir
      const templateDir = this.template.resolvePath({
        moduleName: moduleInfo.relativeName,
        path: `create/${template}`,
      });
      // render
      await this.template.renderDir({ targetDir, templateDir });
      // lerna bootstrap
      await this.helper.lernaBootstrap();
      // reload
      ctx.app.meta.reload.now();
    }
  }

  return Cli;
};


/***/ }),

/***/ 29:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const fs = __webpack_require__(147);
const path = __webpack_require__(17);

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Cli extends ctx.app.meta.CliBase(ctx) {
    async execute({ user }) {
      const { argv } = this.context;
      // super
      await super.execute({ user });
      // suite name/info
      const suiteName = argv.name;
      argv.suiteInfo = this.helper.parseSuiteInfo(suiteName);
      // check if exists
      const _suite = this.helper.findSuite(suiteName);
      if (_suite) {
        throw new Error(`suite exists: ${suiteName}`);
      }
      // target dir
      let targetDir = path.join(argv.projectPath, 'src/suite', suiteName);
      if (fs.existsSync(targetDir)) {
        throw new Error(`suite exists: ${suiteName}`);
      }
      targetDir = await this.helper.ensureDir(targetDir);
      // templateDir
      const templateDir = this.template.resolvePath({
        moduleName: moduleInfo.relativeName,
        path: 'create/suite',
      });
      // render
      await this.template.renderDir({ targetDir, templateDir });
      // reload
      ctx.app.meta.reload.now();
    }
  }

  return Cli;
};


/***/ }),

/***/ 66:
/***/ ((module) => {

module.exports = ctx => {
  class Cli extends ctx.app.meta.CliBase(ctx) {
    async execute({ user }) {
      const { argv } = this.context;
      // super
      await super.execute({ user });
      // module/group
      const moduleWant = argv.module;
      let groupWant = argv.group;
      if (!moduleWant) groupWant = null;
      // commandsAll
      const commandsAll = ctx.bean.cli._commandsAll();
      // modulesShow
      let modulesShow;
      if (moduleWant) {
        if (!commandsAll[moduleWant]) throw new Error(`cli module not found: ${moduleWant}`);
        modulesShow = [moduleWant];
      } else {
        modulesShow = Object.keys(commandsAll);
      }
      // loop
      const total = modulesShow.length;
      for (let index = 0; index < total; index++) {
        const moduleShow = modulesShow[index];
        // log
        await this.console.log({
          progressNo: 0,
          total,
          progress: index,
          text: moduleShow,
        });
        // show
        await this._moduleShow({ moduleShow, groupWant, commandsAll });
      }
      // await this.console.log({ text: JSON.stringify(modulesWant) });
    }

    async _moduleShow({ moduleShow, groupWant, commandsAll }) {
      // _module
      const _module = commandsAll[moduleShow];
      // groupsShow
      let groupsShow;
      if (groupWant) {
        if (!_module[groupWant]) throw new Error(`cli module group not found: ${moduleShow}:${groupWant}`);
        groupsShow = [groupWant];
      } else {
        groupsShow = Object.keys(_module);
      }
      // table
      const table = this.helper.newTable({
        head: ['Command', 'Version', 'Description'],
        colWidths: [30, 10, 40],
      });
      // group
      const groupCount = groupsShow.length;
      for (let index = 0; index < groupCount; index++) {
        const groupShow = groupsShow[index];
        const _group = _module[groupShow];
        for (const commandName in _group) {
          const _command = _group[commandName];
          const cliFullName = this._combineCliFullName({ moduleShow, groupShow, commandName });
          const version = _command.info.version;
          const description = ctx.text(_command.info.description || _command.info.title);
          table.push([cliFullName, version, description]);
        }
        if (index < groupCount - 1) {
          table.push([]);
        }
      }
      // log
      await this.console.log({ text: table.toString() });
    }

    _combineCliFullName({ moduleShow, groupShow, commandName }) {
      const parts = [];
      if (moduleShow === 'a-clibooster') {
        parts.push('');
      } else {
        parts.push(moduleShow);
      }
      if (groupShow === 'default') {
        parts.push('');
      } else {
        parts.push(groupShow);
      }
      parts.push(commandName);
      return parts.join(':');
    }
  }

  return Cli;
};


/***/ }),

/***/ 467:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const path = __webpack_require__(17);
const require3 = __webpack_require__(638);
const AdmZip = require3('adm-zip');
const shajs = require3('sha.js');
const semver = require3('semver');
const utility = require3('utility');
const eggBornUtils = require3('egg-born-utils');
const CliStoreBase = __webpack_require__(210);

module.exports = ctx => {
  class Cli extends CliStoreBase(ctx) {
    constructor(options) {
      super(options, 'publish');
    }

    async onExecuteStoreCommandEntity({ entityName, entityConfig }) {
      // fetch entity status
      const entityStatus = await this.openAuthClient.post({
        path: '/cabloy/store/store/publish/entityStatus',
        body: {
          entityName,
        },
      });
      if (!entityStatus) {
        // not found
        return { code: 1001 };
      }
      // entityHash
      const entityHash = entityStatus.entity.entityHash ? JSON.parse(entityStatus.entity.entityHash) : {};
      // need official/trial
      const needOfficial = entityStatus.entity.moduleLicenseFull !== 0;
      const needTrial = entityStatus.entity.moduleLicenseTrial !== 0;
      // publish: suite/module
      let res;
      if (entityStatus.entity.entityTypeCode === 1) {
        // suite
        res = await this._publishSuite({
          suiteName: entityName,
          entityConfig,
          entityStatus,
          entityHash,
          needOfficial,
          needTrial,
        });
      } else {
        // module
        res = await this._publishModuleIsolate({
          moduleName: entityName,
          entityConfig,
          entityStatus,
          entityHash,
          needOfficial,
          needTrial,
        });
      }
      return res;
    }

    async _publishModuleIsolate({ moduleName, entityConfig, entityHash, entityStatus, needOfficial, needTrial }) {
      // check if exists
      const module = this.helper.findModule(moduleName);
      if (!module) {
        // not found
        return { code: 1001 };
      }
      // zip module
      const moduleMeta = {
        name: moduleName,
        root: module.root,
        pkg: module.pkg,
        package: await eggBornUtils.tools.loadJSON(module.pkg), // module.package,
      };
      const moduleHash = entityHash.default || {};
      await this._zipSuiteModule({ moduleMeta, moduleHash, needOfficial, needTrial });
      if (!moduleMeta.changed) {
        // No Changes Found
        return { code: 2001 };
      }
      // upload module isolate
      await this._uploadModuleIsolate({ moduleMeta, entityStatus, needOfficial, needTrial });
      // handleScripts
      await this._handleScripts({ entityMeta: moduleMeta, entityConfig });
      // submitted
      return { code: 2000, args: [moduleMeta.package.version] };
    }

    async _publishSuite({ suiteName, entityConfig, entityHash, entityStatus, needOfficial, needTrial }) {
      // check if exists
      const suite = this.helper.findSuite(suiteName);
      if (!suite) {
        // not found
        return { code: 1001 };
      }
      // zip modules
      const pathSuite = suite.root;
      const filePkgs = await eggBornUtils.tools.globbyAsync(`${pathSuite}/modules/*/package.json`);
      const modulesMeta = [];
      for (const filePkg of filePkgs) {
        // name
        const name = filePkg.split('/').slice(-2)[0];
        // meta
        const _package = await eggBornUtils.tools.loadJSON(filePkg);
        const root = path.dirname(filePkg);
        const moduleMeta = {
          name,
          root,
          pkg: filePkg,
          package: _package,
        };
        modulesMeta.push(moduleMeta);
        const moduleHash = entityHash[moduleMeta.name] || {};
        await this._zipSuiteModule({ moduleMeta, moduleHash, needOfficial, needTrial });
      }
      // zip suite
      const filePkg = path.join(pathSuite, 'package.json');
      const _package = await eggBornUtils.tools.loadJSON(filePkg);
      const suiteMeta = {
        name: suiteName,
        root: pathSuite,
        pkg: filePkg,
        package: _package,
      };
      const suiteHash = entityHash.default || {};
      await this._zipSuite({ modulesMeta, suiteMeta, suiteHash });
      if (!suiteMeta.changed) {
        // No Changes Found
        return { code: 2001 };
      }
      // zip all
      const zipSuiteAll = await this._zipSuiteAll({ suiteMeta, modulesMeta, needOfficial, needTrial });
      // upload all
      await this._uploadSuiteAll({ suiteMeta, zipSuiteAll, entityStatus, needOfficial, needTrial });
      // handleScripts
      await this._handleScripts({ entityMeta: suiteMeta, entityConfig });
      // submitted
      return { code: 2000, args: [suiteMeta.package.version] };
    }

    async _uploadModuleIsolate({ moduleMeta, needOfficial, needTrial }) {
      await this.openAuthClient.post({
        path: '/cabloy/store/store/publish/entityPublish',
        body: {
          data: {
            entityName: moduleMeta.name,
            entityVersion: moduleMeta.package.version,
            entityHash: JSON.stringify({ default: moduleMeta.zipOfficial.hash }, null, 2),
            zipOfficial: needOfficial ? utility.base64encode(moduleMeta.zipOfficial.buffer, false) : undefined,
            zipTrial: needTrial ? utility.base64encode(moduleMeta.zipTrial.buffer, false) : undefined,
          },
        },
      });
    }

    async _uploadSuiteAll({ suiteMeta, zipSuiteAll, needOfficial, needTrial }) {
      await this.openAuthClient.post({
        path: '/cabloy/store/store/publish/entityPublish',
        body: {
          data: {
            entityName: suiteMeta.name,
            entityVersion: suiteMeta.package.version,
            entityHash: JSON.stringify(zipSuiteAll.entityHash, null, 2),
            zipOfficial: needOfficial ? utility.base64encode(zipSuiteAll.zipOfficial.buffer, false) : undefined,
            zipTrial: needTrial ? utility.base64encode(zipSuiteAll.zipTrial.buffer, false) : undefined,
          },
        },
      });
    }

    async _zipSuiteAll({ suiteMeta, modulesMeta, needOfficial, needTrial }) {
      const zipSuiteAll = {};
      // hash
      zipSuiteAll.entityHash = this._zipSuiteAll_hash({ suiteMeta, modulesMeta });
      // zip official
      if (needOfficial) {
        zipSuiteAll.zipOfficial = await this._zipSuiteAll_zip({ suiteMeta, modulesMeta, type: 'official' });
      }
      // zip trial
      if (needTrial) {
        zipSuiteAll.zipTrial = await this._zipSuiteAll_zip({ suiteMeta, modulesMeta, type: 'trial' });
      }
      return zipSuiteAll;
    }

    _zipSuiteAll_hash({ suiteMeta, modulesMeta }) {
      const entityHash = {};
      entityHash.default = suiteMeta.zipSuite.hash;
      for (const moduleMeta of modulesMeta) {
        entityHash[moduleMeta.name] = moduleMeta.zipOfficial.hash;
      }
      return entityHash;
    }

    async _zipSuiteAll_zip({ suiteMeta, modulesMeta, type }) {
      const zip = new AdmZip();
      zip.addFile('default', suiteMeta.zipSuite.buffer);
      for (const moduleMeta of modulesMeta) {
        const buffer = type === 'official' ? moduleMeta.zipOfficial.buffer : moduleMeta.zipTrial.buffer;
        zip.addFile(moduleMeta.name, buffer);
      }
      const buffer = await zip.toBufferPromise();
      return { buffer };
    }

    async _zipSuite({ modulesMeta, suiteMeta, suiteHash }) {
      let zipSuite;
      // check modulesMeta
      let changed = modulesMeta.some(moduleMeta => moduleMeta.changed);
      if (!changed) {
        // check suite
        zipSuite = await this._zipAndHash({
          patterns: this.configModule.store.publish.patterns.suite,
          pathRoot: suiteMeta.root,
          needHash: true,
        });
        changed = zipSuite.hash.hash !== suiteHash.hash;
      }
      if (changed) {
        suiteMeta.changed = true;
        // bump
        if (suiteHash.version && !semver.gt(suiteMeta.package.version, suiteHash.version)) {
          suiteMeta.package.version = semver.inc(suiteHash.version, 'patch');
          await eggBornUtils.tools.saveJSON(suiteMeta.pkg, suiteMeta.package);
          zipSuite = null;
        }
      }
      // force zip
      if (!zipSuite) {
        // zip suite
        zipSuite = await this._zipAndHash({
          patterns: this.configModule.store.publish.patterns.suite,
          pathRoot: suiteMeta.root,
          needHash: true,
        });
      }
      // ok
      zipSuite.hash.version = suiteMeta.package.version;
      suiteMeta.zipSuite = zipSuite;
    }

    async _zipSuiteModule({ moduleMeta, moduleHash, needTrial }) {
      // log
      await this.console.log(`===> module: ${moduleMeta.name}`);
      // zip officialTemp
      const patternsTemp = this.configModule.store.publish.patterns.official.concat(['!dist']);
      let zipOfficialTemp = await this._zipAndHash({
        patterns: patternsTemp,
        pathRoot: moduleMeta.root,
        needHash: true,
      });
      // check hash
      if (zipOfficialTemp.hash.hash !== moduleHash.hash) {
        moduleMeta.changed = true;
        // build:all
        await this.helper.spawnCmd({
          cmd: 'npm',
          args: ['run', 'build:all'],
          options: {
            cwd: moduleMeta.root,
          },
        });
        // bump
        if (moduleHash.version && !semver.gt(moduleMeta.package.version, moduleHash.version)) {
          moduleMeta.package.version = semver.inc(moduleHash.version, 'patch');
          await eggBornUtils.tools.saveJSON(moduleMeta.pkg, moduleMeta.package);
          zipOfficialTemp = await this._zipAndHash({
            patterns: patternsTemp,
            pathRoot: moduleMeta.root,
            needHash: true,
          });
        }
      }
      // zip official
      const zipOfficial = await this._zipAndHash({
        patterns: this.configModule.store.publish.patterns.official,
        pathRoot: moduleMeta.root,
        needHash: false,
      });
      zipOfficial.hash = {
        hash: zipOfficialTemp.hash.hash,
        version: moduleMeta.package.version,
      };
      moduleMeta.zipOfficial = zipOfficial;
      // zip trial
      if (needTrial) {
        moduleMeta.zipTrial = await this._zipAndHash({
          patterns: this.configModule.store.publish.patterns.trial,
          pathRoot: moduleMeta.root,
          needHash: false,
        });
      }
    }

    async _zipAndHash({ patterns, pathRoot, needHash }) {
      // globby
      const files = await eggBornUtils.tools.globbyAsync(patterns, { cwd: pathRoot });
      files.sort();
      // zip
      const zip = new AdmZip();
      for (const file of files) {
        const dirName = path.dirname(file);
        const fileName = path.basename(file);
        zip.addLocalFile(path.join(pathRoot, file), dirName, fileName);
      }
      const buffer = await zip.toBufferPromise();
      // hash
      const hash = needHash ? shajs('sha256').update(buffer).digest('hex') : undefined;
      // ok
      return { buffer, hash: { hash } };
    }

    async _handleScripts({ entityMeta, entityConfig }) {
      if (!entityConfig.scripts) return;
      for (const script of entityConfig.scripts) {
        if (script === 'npmPublish') {
          await this._handleScripts_npmPublish({ entityMeta, entityConfig });
        } else if (script === 'gitCommit') {
          await this._handleScripts_gitCommit({ entityMeta, entityConfig });
        } else {
          await this._handleScripts_general({ entityMeta, entityConfig, script });
        }
      }
    }

    async _handleScripts_npmPublish({ entityMeta }) {
      const { argv } = this.context;
      // npm publish
      await this.helper.spawnCmd({
        cmd: 'npm',
        args: ['publish'],
        options: {
          cwd: entityMeta.root,
        },
      });
      // cabloy path
      const cabloyPath = eggBornUtils.tools._getCabloyPath(argv.projectPath);
      if (cabloyPath) {
        const pkg = path.join(cabloyPath, 'package.json');
        const _package = await eggBornUtils.tools.loadJSON(pkg);
        if (_package.dependencies[entityMeta.package.name]) {
          _package.dependencies[entityMeta.package.name] = `^${entityMeta.package.version}`;
          await eggBornUtils.tools.saveJSON(pkg, _package);
        }
      }
    }

    async _handleScripts_gitCommit({ entityMeta }) {
      // git add .
      await this.helper.spawnExe({
        cmd: 'git',
        args: ['add', '.'],
        options: {
          cwd: entityMeta.root,
        },
      });
      // git commit
      await this.helper.spawnExe({
        cmd: 'git',
        args: ['commit', '-m', `chore: version ${entityMeta.package.version}`],
        options: {
          cwd: entityMeta.root,
        },
      });
      // git push
      await this.helper.spawnExe({
        cmd: 'git',
        args: ['push'],
        options: {
          cwd: entityMeta.root,
        },
      });
    }

    async _handleScripts_general({ entityMeta, script }) {
      const args = script.split(' ');
      const cmd = args.shift();
      await this.helper.spawn({
        cmd,
        args,
        options: {
          cwd: entityMeta.root,
        },
      });
    }
  }

  return Cli;
};


/***/ }),

/***/ 937:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const path = __webpack_require__(17);
const os = __webpack_require__(37);
const require3 = __webpack_require__(638);
const eggBornUtils = require3('egg-born-utils');
const AdmZip = require3('adm-zip');
const semver = require3('semver');
const fse = require3('fs-extra');
const rimraf = require3('mz-modules/rimraf');
const CliStoreBase = __webpack_require__(210);

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Cli extends CliStoreBase(ctx) {
    constructor(options) {
      super(options, 'sync');
    }

    async onExecuteStoreCommandEntity({ entityName }) {
      // fetch entity status
      const entityStatus = await this.openAuthClient.post({
        path: '/cabloy/store/store/sync/entityStatus',
        body: {
          entityName,
        },
      });
      if (!entityStatus) {
        // not found
        return { code: 1001 };
      }
      // prepare licenseMeta
      let licenseMeta;
      if (entityStatus.licenseFull.download) {
        licenseMeta = entityStatus.licenseFull;
      }
      if (!licenseMeta && entityStatus.licenseTrial.download) {
        licenseMeta = entityStatus.licenseTrial;
      }
      if (!licenseMeta) {
        licenseMeta = entityStatus.licenseFull;
      }
      // handle
      const res = await this._onExecuteStoreCommandEntity_handle({ entityName, entityStatus, licenseMeta });
      if (!res) return licenseMeta;
      // combine message
      const args = res.args || [];
      const message1 = ctx.parseSuccess.module(moduleInfo.relativeName, res.code, ...args).message;
      let message2 = '';
      if (licenseMeta.code) {
        const args = licenseMeta.args || [];
        message2 = ctx.parseSuccess.module(moduleInfo.relativeName, licenseMeta.code, ...args).message;
      }
      // ok
      return {
        code: res.code,
        message: `${message1} ${message2}`,
      };
    }

    async _onExecuteStoreCommandEntity_handle({ entityName, entityStatus, licenseMeta }) {
      // entityVersion
      const entityVersion = entityStatus.entity.moduleVersion;
      // entityMeta
      const entityMeta = await this._getEntityMeta({ entityName, entityStatus });
      // check version
      if (entityMeta.version && !semver.lt(entityMeta.version, entityVersion)) {
        // No Changes Found
        return { code: 2001 };
      }
      // check if has download
      if (!licenseMeta.download) {
        return null;
      }
      // download
      const buffer = await this.openAuthClient.getRaw({
        path: licenseMeta.download.replace(/\/a\/file\/file\/download\//, '/cabloy/store/store/sync/download/'),
      });
      // unzip
      const tempPath = await this._unzip({ entityName, buffer });
      // remove old path/files
      await rimraf(entityMeta.root);
      // copy to: suite/module
      if (entityStatus.entity.entityTypeCode === 1) {
        await this._copyToSuite({ tempPath, suiteName: entityName, entityMeta });
      } else {
        await this._copyToModuleIsolate({ tempPath, moduleName: entityName, entityMeta });
      }
      // remove temp path
      await rimraf(tempPath);
      // lerna bootstrap
      this._needLernaBootstrap = true;
      // synced
      return { code: 3000, args: [entityVersion] };
    }

    async _copyToSuite({ tempPath, entityMeta }) {
      // default
      const zip = new AdmZip(path.join(tempPath, 'default'));
      zip.extractAllTo(entityMeta.root, true);
      // others
      const files = await eggBornUtils.tools.globbyAsync(['*', '!default'], { cwd: tempPath });
      for (const file of files) {
        const zip = new AdmZip(path.join(tempPath, file));
        zip.extractAllTo(path.join(entityMeta.root, 'modules', file), true);
      }
    }

    async _copyToModuleIsolate({ tempPath, entityMeta }) {
      await fse.move(tempPath, entityMeta.root, { overwrite: true });
    }

    async _unzip({ entityName, buffer }) {
      const tempPath = path.join(os.tmpdir(), entityName);
      await rimraf(tempPath);
      const zip = new AdmZip(buffer);
      zip.extractAllTo(tempPath, true);
      return tempPath;
    }

    _getEntityType({ entityStatus }) {
      return entityStatus.entity.entityTypeCode;
    }

    async _getEntityMeta({ entityName, entityStatus }) {
      const { argv } = this.context;
      // entityMeta
      const entityType = this._getEntityType({ entityStatus });
      const entityMeta = {
        root: path.join(argv.projectPath, entityType === 1 ? 'src/suite-vendor' : 'src/module-vendor', entityName),
      };
      // version
      entityMeta.version = await this._getEntityVersion(entityMeta.root);
      return entityMeta;
    }
    async _getEntityVersion(entityPath) {
      const filePkg = path.join(entityPath, 'package.json');
      const _package = await eggBornUtils.tools.loadJSON(filePkg);
      if (!_package) return null;
      return _package.version;
    }
  }

  return Cli;
};


/***/ }),

/***/ 971:
/***/ ((module) => {

module.exports = ctx => {
  class Cli extends ctx.app.meta.CliBase(ctx) {
    get localToken() {
      return ctx.bean.local.module('a-authopen').token;
    }

    async execute({ user }) {
      const { argv } = this.context;
      // super
      await super.execute({ user });
      // add
      const { fileName } = await this.localToken.add({
        name: argv.name,
        host: argv.host,
        clientID: argv.clientID,
        clientSecret: argv.clientSecret,
        log: false,
      });
      // chalk
      const text = this.helper.chalk.keyword('cyan')(`\n  ${fileName}\n`);
      await this.console.log({ text });
    }
  }

  return Cli;
};


/***/ }),

/***/ 65:
/***/ ((module) => {

module.exports = ctx => {
  class Cli extends ctx.app.meta.CliBase(ctx) {
    get localToken() {
      return ctx.bean.local.module('a-authopen').token;
    }

    async execute({ user }) {
      const { argv } = this.context;
      // super
      await super.execute({ user });
      // add
      const { fileName } = await this.localToken.delete({
        name: argv.name,
        log: false,
      });
      // chalk
      const text = this.helper.chalk.keyword('cyan')(`\n  ${fileName}\n`);
      await this.console.log({ text });
    }
  }

  return Cli;
};


/***/ }),

/***/ 301:
/***/ ((module) => {

module.exports = ctx => {
  class Cli extends ctx.app.meta.CliBase(ctx) {
    get localToken() {
      return ctx.bean.local.module('a-authopen').token;
    }

    async execute({ user }) {
      // super
      await super.execute({ user });
      // add
      const { fileName, config } = await this.localToken.list({
        log: false,
      });
      // tokens
      if (!config.tokens) config.tokens = {};
      const table = this.helper.newTable({
        head: ['Token Name', 'Host'],
        colWidths: [30, 50],
      });
      for (const tokenName in config.tokens) {
        const token = config.tokens[tokenName];
        table.push([tokenName, token.host]);
      }
      await this.console.log({ text: table.toString() });
      // fileName
      const text = this.helper.chalk.keyword('cyan')(`\n  ${fileName}\n`);
      await this.console.log({ text });
    }
  }

  return Cli;
};


/***/ }),

/***/ 544:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const path = __webpack_require__(17);
const require3 = __webpack_require__(638);
const babel = require3('@babel/core');
const UglifyJS = require3('uglify-js');
const fse = require3('fs-extra');

module.exports = ctx => {
  class Cli extends ctx.app.meta.CliBase(ctx) {
    async execute({ user }) {
      const { cwd, argv } = this.context;
      // super
      await super.execute({ user });
      const files = argv._;
      const total = files.length;
      for (let index = 0; index < total; index++) {
        const file = files[index];
        // log
        await this.console.log({
          progressNo: 0,
          total,
          progress: index,
          text: file,
        });
        // transform
        const fileSrc = path.join(cwd, file);
        const pos = fileSrc.lastIndexOf('.js');
        if (pos === -1) continue;
        const fileDest = fileSrc.substr(0, pos) + '.min.js';
        this._transform(fileSrc, fileDest);
      }
    }

    _transform(fileSrc, fileDest) {
      let content = fse.readFileSync(fileSrc);
      // transform
      content = babel.transform(content, {
        ast: false,
        babelrc: false,
        presets: ['@babel/preset-env'],
        plugins: [],
      }).code;
      // uglify
      const output = UglifyJS.minify(content);
      if (output.error) throw new Error(`${output.error.name}: ${output.error.message}`);
      content = output.code;
      // output
      fse.outputFileSync(fileDest, content);
    }
  }

  return Cli;
};


/***/ }),

/***/ 508:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const path = __webpack_require__(17);
const require3 = __webpack_require__(638);
const fse = require3('fs-extra');
const eggBornUtils = require3('egg-born-utils');
const bb = require3('bluebird');
const xml2js = require3('xml2js');

module.exports = ctx => {
  class Cli extends ctx.app.meta.CliBase(ctx) {
    async execute({ user }) {
      const { argv } = this.context;
      // super
      await super.execute({ user });
      const moduleNames = argv._;
      const total = moduleNames.length;
      for (let index = 0; index < total; index++) {
        const moduleName = moduleNames[index];
        // log
        await this.console.log({
          progressNo: 0,
          total,
          progress: index,
          text: moduleName,
        });
        // generate
        await this._generateIcons({ moduleName });
      }
    }

    async _generateIcons({ moduleName }) {
      const module = this.helper.findModule(moduleName);
      if (!module) throw new Error(`module not found: ${moduleName}`);
      const modulePath = module.root;
      const iconsSrc = path.join(modulePath, 'icons/src');
      // groups
      const groups = await this._resolveGroups({ iconsSrc });
      for (const group of groups) {
        group.iconNames = await this._generateIconsGroup({ modulePath, iconsSrc, group });
      }
      // write to front
      const groupsFrontImport = [];
      const groupsFrontExport = [];
      for (const group of groups) {
        groupsFrontImport.push(`import _${group.name} from '../assets/icons/groups/${group.name}.svg';`);
        groupsFrontExport.push(`${group.name}: _${group.name},`);
      }
      const jsFront = `${groupsFrontImport.join('\n')}\n\nexport default {\n  ${groupsFrontExport.join('\n  ')}\n};\n`;
      const pathFront = path.join(modulePath, 'front/src/config');
      const fileFront = path.join(modulePath, 'front/src/config/icons.js');
      await fse.ensureDir(pathFront);
      await fse.writeFile(fileFront, jsFront);
      // write to backend
      const groupsBackend = [];
      for (const group of groups) {
        groupsBackend.push(`${group.name}: '${group.iconNames.join(',')}',`);
      }
      const jsBackend = `module.exports = {\n  ${groupsBackend.join('\n  ')}\n};\n`;
      const pathBackend = path.join(modulePath, 'backend/src/config/icons');
      const fileBackend = path.join(modulePath, 'backend/src/config/icons/groups.js');
      await fse.ensureDir(pathBackend);
      await fse.writeFile(fileBackend, jsBackend);
    }

    async _generateIconsGroup({ modulePath, iconsSrc, group }) {
      // icons
      const files = await eggBornUtils.tools.globbyAsync(`${iconsSrc}/${group.name}/*.svg`);
      const iconNames = files.map(item => path.basename(item, '.svg'));
      // symbols
      const symbols = [];
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const iconName = iconNames[index];
        const symbol = await this._combineSymbol({ file, iconName });
        symbols.push(symbol);
      }
      // xml
      const xml = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
${symbols.join('\n')}
</svg>`;
      // write
      const pathDest = path.join(modulePath, 'front/src/assets/icons', 'groups');
      await fse.ensureDir(pathDest);
      const fileDest = path.join(pathDest, `${group.name}.svg`);
      await fse.writeFile(fileDest, xml);
      // ok
      return iconNames;
    }

    async _combineSymbol({ file, iconName }) {
      // svg
      const xml = await fse.readFile(file);
      const svg = await this.parseXML({ xml });
      // patch
      delete svg.defs;
      delete svg.metadata;
      // root
      const domRoot = svg.$;
      const attrs = { id: iconName };
      if (domRoot.preserveAspectRatio) attrs.preserveAspectRatio = domRoot.preserveAspectRatio;
      if (domRoot.viewBox) attrs.viewBox = domRoot.viewBox;
      svg.$ = attrs;
      return this.buildXML({ xml: svg, rootName: 'symbol' });
    }

    async _resolveGroups({ iconsSrc }) {
      const groupPaths = await eggBornUtils.tools.globbyAsync(`${iconsSrc}/*`, { onlyDirectories: true });
      return groupPaths.map(item => {
        return {
          name: path.basename(item),
        };
      });
    }

    async parseXML({ xml, trim = true, explicitArray = false, explicitRoot = false }) {
      const parser = new xml2js.Parser({ trim, explicitArray, explicitRoot });
      return await bb.fromCallback(cb => {
        parser.parseString(xml, cb);
      });
    }

    buildXML({ xml, cdata = true, headless = true, rootName = 'xml' }) {
      return new xml2js.Builder({ cdata, headless, rootName }).buildObject(xml);
    }
  }

  return Cli;
};


/***/ }),

/***/ 899:
/***/ ((module) => {

module.exports = app => {
  class Version extends app.meta.BeanBase {
    async update(options) {}

    async init(options) {}

    async test() {}
  }

  return Version;
};


/***/ }),

/***/ 187:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const versionManager = __webpack_require__(899);
const cliDefaultList = __webpack_require__(66);
const cliTokenAdd = __webpack_require__(971);
const cliTokenDelete = __webpack_require__(65);
const cliTokenList = __webpack_require__(301);
const cliToolsBabel = __webpack_require__(544);
const cliToolsIcons = __webpack_require__(508);
const cliCreateSuite = __webpack_require__(29);
const cliCreateModule = __webpack_require__(554);
const cliCreateAtom = __webpack_require__(511);
const cliCreateController = __webpack_require__(199);
const cliStoreSync = __webpack_require__(937);
const cliStorePublish = __webpack_require__(467);

module.exports = app => {
  const beans = {
    // version
    'version.manager': {
      mode: 'app',
      bean: versionManager,
    },
    // cli
    'cli.default.list': {
      mode: 'ctx',
      bean: cliDefaultList,
    },
    'cli.token.add': {
      mode: 'ctx',
      bean: cliTokenAdd,
    },
    'cli.token.delete': {
      mode: 'ctx',
      bean: cliTokenDelete,
    },
    'cli.token.list': {
      mode: 'ctx',
      bean: cliTokenList,
    },
    'cli.tools.babel': {
      mode: 'ctx',
      bean: cliToolsBabel,
    },
    'cli.tools.icons': {
      mode: 'ctx',
      bean: cliToolsIcons,
    },
    'cli.create.suite': {
      mode: 'ctx',
      bean: cliCreateSuite,
    },
    'cli.create.module': {
      mode: 'ctx',
      bean: cliCreateModule,
    },
    'cli.create.atom': {
      mode: 'ctx',
      bean: cliCreateAtom,
    },
    'cli.create.controller': {
      mode: 'ctx',
      bean: cliCreateController,
    },
    'cli.store.sync': {
      mode: 'ctx',
      bean: cliStoreSync,
    },
    'cli.store.publish': {
      mode: 'ctx',
      bean: cliStorePublish,
    },
  };
  return beans;
};


/***/ }),

/***/ 210:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const require3 = __webpack_require__(638);
const eggBornUtils = require3('egg-born-utils');

// const __storeTokenHost = 'https://admin.cabloy.com';
// const __storeTokenHost = 'http://localhost:9192';

module.exports = ctx => {
  const moduleInfo = ctx.app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class CliStoreBase extends ctx.app.meta.CliBase(ctx) {
    constructor(options, commandName) {
      super(options);
      this.commandName = commandName;
      this.tokenName = `store.${commandName}`;
      this.openAuthClient = null;
    }

    get localToken() {
      return ctx.bean.local.module('a-authopen').token;
    }

    get configModule() {
      return ctx.config.module(moduleInfo.relativeName);
    }

    async meta({ user }) {
      // meta
      const meta = await super.meta({ user });
      // check if token exists
      const item = await this.localToken.get({ name: this.tokenName });
      if (item) {
        delete meta.groups;
      }
      // ok
      return meta;
    }

    async execute({ user }) {
      // super
      await super.execute({ user });
      // token
      await this.addToken();
      // executeStoreCommand
      await this.executeStoreCommand();
    }

    async addToken() {
      const { argv } = this.context;
      const { clientID, clientSecret } = argv;
      if (clientID && clientSecret) {
        await this.localToken.add({
          name: this.tokenName,
          host: this.configModule.store.token.host,
          clientID,
          clientSecret,
        });
      }
    }

    async executeStoreCommand() {
      // token
      const token = await this.localToken.get({ name: this.tokenName });
      // OpenAuthClient
      this.openAuthClient = new eggBornUtils.OpenAuthClient({ token });
      // signin
      await this.openAuthClient.signin();
      // execute command
      try {
        this._needLernaBootstrap = false;
        await this._executeStoreCommand();
        if (this._needLernaBootstrap) {
          await this.helper.lernaBootstrap();
          // reload
          ctx.app.meta.reload.now();
        }
      } catch (err) {
        //  logout
        await this.openAuthClient.logout();
        this.openAuthClient = null;
        throw err;
      }
    }

    async _executeStoreCommand() {
      const { argv } = this.context;
      // entityNames
      let entityNames = argv._;
      if (entityNames.length === 0) {
        // load all entities
        const entitiesConfig = ctx.bean.util.getProperty(
          this.cabloyConfig.get(),
          `store.commands.${this.commandName}.entities`
        );
        entityNames = Object.keys(entitiesConfig);
      }
      // loop
      const total = entityNames.length;
      const results = [];
      for (let index = 0; index < total; index++) {
        const entityName = entityNames[index];
        // log
        await this.console.log({
          progressNo: 0,
          total,
          progress: index,
          text: entityName,
        });
        // command entity
        const result = await this._executeStoreCommandEntity({ entityName });
        result.entityName = entityName;
        // result
        if (result.code && !result.message) {
          const args = result.args || [];
          result.message = ctx.parseSuccess.module(moduleInfo.relativeName, result.code, ...args).message;
        }
        if (result.message) {
          await this.console.log({ text: result.message });
        }
        results.push(result);
      }
      // log results
      await this._logResults({ results });
    }

    async _executeStoreCommandEntity({ entityName }) {
      try {
        // save to config
        let entityConfig = ctx.bean.util.getProperty(
          this.cabloyConfig.get(),
          `store.commands.${this.commandName}.entities.${entityName}`
        );
        if (!entityConfig) {
          entityConfig = {};
          ctx.bean.util.setProperty(
            this.cabloyConfig.get(),
            `store.commands.${this.commandName}.entities.${entityName}`,
            entityConfig
          );
          await this.cabloyConfig.save();
        }
        // onExecuteStoreCommandEntity
        return await this.onExecuteStoreCommandEntity({ entityName, entityConfig });
      } catch (err) {
        return {
          code: err.code,
          message: err.message,
        };
      }
    }

    async _logResults({ results }) {
      // sort
      results.sort((a, b) => a.code - b.code);
      // table
      const table = this.helper.newTable({
        head: ['Entity Name', 'Message'],
        colWidths: [30, 80],
      });
      for (const result of results) {
        table.push([result.entityName, result.message]);
        table.push(['', this._getEntityURL(result.entityName)]);
      }
      await this.console.log({ text: table.toString() });
    }

    _getEntityURL(entityName) {
      const locale = this.openAuthClient.locale;
      return `https://store.cabloy.com/${locale === 'zh-cn' ? 'zh-cn/' : ''}articles/${entityName}.html`;
    }
  }
  return CliStoreBase;
};


/***/ }),

/***/ 184:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'create.atom',
    resource: {
      atomStaticKey: 'cliCreate',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Create Atom',
      usage: 'npm run cli :create:atom atomClassName -- [--module=]',
    },
    options: {
      module: {
        description: 'module name',
        type: 'string',
      },
    },
    groups: {
      default: {
        questions: {
          atomClassName: {
            type: 'input',
            message: 'atomClassName',
            initial: {
              expression: 'context.argv._[0]',
            },
            required: true,
          },
          module: {
            type: 'input',
            message: 'module name',
            required: true,
          },
        },
      },
      atomClassInfoAuto: {
        questions: {
          providerId: {
            type: 'input',
            message: 'providerId',
            initial: {
              expression: 'context.argv.module.split("-")[0]',
            },
            silent: true,
          },
          atomClassNameCapitalize: {
            type: 'input',
            message: 'atomClassNameCapitalize',
            initial: {
              expression:
                'context.argv.atomClassName.replace(context.argv.atomClassName[0], context.argv.atomClassName[0].toUpperCase())',
            },
            silent: true,
          },
        },
      },
    },
  };
};


/***/ }),

/***/ 222:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'create.controller',
    resource: {
      atomStaticKey: 'cliCreate',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Create Controller',
      usage: 'npm run cli :create:controller controllerName -- [--module=]',
    },
    options: {
      module: {
        description: 'module name',
        type: 'string',
      },
    },
    groups: {
      default: {
        questions: {
          controllerName: {
            type: 'input',
            message: 'controllerName',
            initial: {
              expression: 'context.argv._[0]',
            },
            required: true,
          },
          module: {
            type: 'input',
            message: 'module name',
            required: true,
          },
        },
      },
      controllerInfoAuto: {
        questions: {
          providerId: {
            type: 'input',
            message: 'providerId',
            initial: {
              expression: 'context.argv.module.split("-")[0]',
            },
            silent: true,
          },
          controllerNameCapitalize: {
            type: 'input',
            message: 'controllerNameCapitalize',
            initial: {
              expression:
                'context.argv.controllerName.replace(context.argv.controllerName[0], context.argv.controllerName[0].toUpperCase())',
            },
            silent: true,
          },
        },
      },
    },
  };
};


/***/ }),

/***/ 793:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'create.module',
    resource: {
      atomStaticKey: 'cliCreate',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Create Module',
      usage: 'npm run cli :create:module moduleName -- [--template=] [--suite=] [--force]',
    },
    options: {
      template: {
        description: 'template',
        type: 'string',
      },
      suite: {
        description: 'suite name',
        type: 'string',
      },
      force: {
        description: 'force',
        type: 'boolean',
      },
    },
    groups: {
      default: {
        questions: {
          template: {
            type: 'select',
            message: 'Specify the module template',
            choices: [
              { name: 'module', message: 'cabloy module template' },
              { name: 'module-business', message: 'cabloy business module template' },
              { name: 'module-business-details', message: 'cabloy business module template with details' },
              { name: 'module-icon', message: 'cabloy icon module template' },
            ],
          },
          suite: {
            type: 'input',
            message: 'suite name',
          },
        },
      },
      moduleInfo: {
        questions: {
          name: {
            type: 'input',
            message: 'module name',
            initial: {
              expression: 'context.argv._[0]',
            },
            required: true,
          },
          description: {
            type: 'input',
            message: 'module description',
          },
          author: {
            type: 'input',
            message: 'module author',
          },
        },
      },
      atomClassInfo: {
        condition: {
          expression: 'context.argv.template==="module-business" || context.argv.template==="module-business-details"',
        },
        questions: {
          providerId: {
            type: 'input',
            message: 'providerId',
            initial: {
              expression: 'context.argv.name.split("-")[0]',
            },
            required: true,
          },
          atomClassName: {
            type: 'input',
            message: 'atomClassName',
            initial: {
              expression: 'context.argv.name.split("-")[1]',
            },
            required: true,
          },
        },
      },
      atomClassInfoAuto: {
        condition: {
          expression: 'context.argv.template==="module-business" || context.argv.template==="module-business-details"',
        },
        questions: {
          atomClassNameCapitalize: {
            type: 'input',
            message: 'atomClassNameCapitalize',
            initial: {
              expression:
                'context.argv.atomClassName.replace(context.argv.atomClassName[0], context.argv.atomClassName[0].toUpperCase())',
            },
            silent: true,
          },
        },
      },
    },
  };
};


/***/ }),

/***/ 687:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'create.suite',
    resource: {
      atomStaticKey: 'cliCreate',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Create Suite',
      usage: 'npm run cli :create:suite suiteName',
    },
    options: {},
    groups: {
      suiteInfo: {
        questions: {
          name: {
            type: 'input',
            message: 'suite name',
            initial: {
              expression: 'context.argv._[0]',
            },
            required: true,
          },
          description: {
            type: 'input',
            message: 'suite description',
          },
          author: {
            type: 'input',
            message: 'suite author',
          },
        },
      },
    },
  };
};


/***/ }),

/***/ 666:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'default.list',
    resource: {
      atomStaticKey: 'cliDefaultList',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Command List',
    },
    options: {
      module: {
        description: 'module',
        type: 'string',
      },
      group: {
        description: 'group',
        type: 'string',
      },
    },
    groups: null,
  };
};


/***/ }),

/***/ 730:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'store.publish',
    resource: {
      atomStaticKey: 'cliStore',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Store: Publish',
      usage: 'npm run cli :store:publish [entity1] [entity2]',
    },
    // options: null,
    groups: {
      default: {
        description: 'CliAuthOpenTokenInfoStorePublish',
        questions: {
          clientID: {
            type: 'input',
            message: 'Client ID',
            required: true,
          },
          clientSecret: {
            type: 'input',
            message: 'Client Secret',
            required: true,
          },
        },
      },
    },
  };
};


/***/ }),

/***/ 609:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'store.sync',
    resource: {
      atomStaticKey: 'cliStore',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Store: Sync',
      usage: 'npm run cli :store:sync [entity1] [entity2]',
    },
    // options: null,
    groups: {
      default: {
        description: 'CliAuthOpenTokenInfoStoreSync',
        questions: {
          clientID: {
            type: 'input',
            message: 'Client ID',
            required: true,
          },
          clientSecret: {
            type: 'input',
            message: 'Client Secret',
            required: true,
          },
        },
      },
    },
  };
};


/***/ }),

/***/ 552:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'token.add',
    resource: {
      atomStaticKey: 'cliToken',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Add Open Auth Token',
    },
    options: {
      name: {
        description: 'name',
        type: 'string',
      },
      host: {
        description: 'host',
        type: 'string',
      },
      clientID: {
        description: 'clientID',
        type: 'string',
      },
      clientSecret: {
        description: 'clientSecret',
        type: 'string',
      },
    },
    groups: {
      default: {
        description: 'Toke Info',
        questions: {
          name: {
            type: 'input',
            message: 'name',
          },
          host: {
            type: 'input',
            message: 'host',
          },
          clientID: {
            type: 'input',
            message: 'clientID',
          },
          clientSecret: {
            type: 'input',
            message: 'clientSecret',
          },
        },
      },
    },
  };
};


/***/ }),

/***/ 443:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'token.delete',
    resource: {
      atomStaticKey: 'cliToken',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Delete Open Auth Token',
    },
    options: {
      name: {
        description: 'name',
        type: 'string',
      },
    },
    groups: {
      default: {
        description: 'Toke Info',
        questions: {
          name: {
            type: 'input',
            message: 'name',
          },
        },
      },
    },
  };
};


/***/ }),

/***/ 160:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'token.list',
    resource: {
      atomStaticKey: 'cliToken',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Open Auth Tokens',
    },
    // options: null,
    // groups: null,
  };
};


/***/ }),

/***/ 807:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'tools.babel',
    resource: {
      atomStaticKey: 'cliTools',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Tools: Babel',
      usage: 'npm run cli :tools:babel file1 [file2]',
    },
    // options: null,
    // groups: null,
  };
};


/***/ }),

/***/ 571:
/***/ ((module) => {

module.exports = app => {
  return {
    bean: 'tools.icons',
    resource: {
      atomStaticKey: 'cliTools',
    },
    info: {
      version: '4.0.0',
      title: 'Cli: Tools: Icons',
      usage: 'npm run cli :tools:icons module1 [module2]',
    },
    // options: null,
    // groups: null,
  };
};


/***/ }),

/***/ 407:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const defaultList = __webpack_require__(666);
const tokenAdd = __webpack_require__(552);
const tokenDelete = __webpack_require__(443);
const tokenList = __webpack_require__(160);
const toolsBabel = __webpack_require__(807);
const toolsIcons = __webpack_require__(571);
const createSuite = __webpack_require__(687);
const createModule = __webpack_require__(793);
const createAtom = __webpack_require__(184);
const createController = __webpack_require__(222);
const storeSync = __webpack_require__(609);
const storePublish = __webpack_require__(730);

module.exports = app => {
  const commands = {
    default: {
      list: defaultList(app),
    },
    token: {
      add: tokenAdd(app),
      delete: tokenDelete(app),
      list: tokenList(app),
    },
    tools: {
      babel: toolsBabel(app),
      icons: toolsIcons(app),
    },
    create: {
      suite: createSuite(app),
      module: createModule(app),
      atom: createAtom(app),
      controller: createController(app),
    },
    store: {
      sync: storeSync(app),
      publish: storePublish(app),
    },
  };
  return commands;
};


/***/ }),

/***/ 76:
/***/ ((module) => {

// eslint-disable-next-line
module.exports = appInfo => {
  const config = {};

  // store
  config.store = {
    token: {
      host: 'https://admin.cabloy.com',
    },
    publish: {
      patterns: {
        trial: [
          '**',
          '!node_modules',
          '!miniprogram_npm',
          '!.git',
          '!.DS_Store',
          '!backend/src',
          '!backend/static',
          '!backend/test',
          '!front/src',
          '!icons',
        ],
        official: ['**', '!node_modules', '!miniprogram_npm', '!.git', '!.DS_Store'],
        suite: ['**', '!node_modules', '!miniprogram_npm', '!.git', '!.DS_Store', '!modules'],
      },
    },
  };

  return config;
};


/***/ }),

/***/ 624:
/***/ ((module) => {

// error code should start from 1001
module.exports = {
  1001: 'Not Found',
  // 2000: publish
  2000: 'Submitted, Version: %s',
  2001: 'No Changes Found',
  // 3000: sync
  3000: 'Synced, Version: %s',
  3001: 'Not Purchased',
  3002: 'Expired, Expired Time: %s',
  3003: 'Expired Time: %s',
};


/***/ }),

/***/ 327:
/***/ ((module) => {

module.exports = {
  CliAuthOpenTokenInfoStoreSync:
    'Open auth token for Cabloy Store sync, more info: https://cabloy.com/articles/cli-store.html',
  CliAuthOpenTokenInfoStorePublish:
    'Open auth token for Cabloy Store publish, more info: https://cabloy.com/articles/cli-store.html',
};


/***/ }),

/***/ 72:
/***/ ((module) => {

module.exports = {
  Submitted: '已提交',
  CliAuthOpenTokenInfoStoreSync:
    '用于Cabloy商店同步的开放认证Token，帮助信息：https://cabloy.com/zh-cn/articles/cli-store.html',
  CliAuthOpenTokenInfoStorePublish:
    '用于Cabloy商店发布的开放认证Token，帮助信息：https://cabloy.com/zh-cn/articles/cli-store.html',
  'Specify the module template': '指定模块模版',
  'Not Found': '未发现',
  'No Changes Found': '没有变更',
  'Submitted, Version: %s': '已提交，版本：%s',
  'Synced, Version: %s': '已同步，版本：%s',
  'Not Purchased': '未购买',
  'Expired, Expired Time: %s': '已过期，过期时间：%s',
  'Expired Time: %s': '过期时间：%s',
};


/***/ }),

/***/ 25:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = {
  'en-us': __webpack_require__(327),
  'zh-cn': __webpack_require__(72),
};


/***/ }),

/***/ 429:
/***/ ((module) => {

module.exports = app => {
  // const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  const resources = [
    // function
    {
      atomName: 'Cli Demo',
      atomStaticKey: 'cliDefaultDemo',
      atomRevision: -1,
      atomCategoryId: 'a-base:function.Cli',
      resourceType: 'a-base:function',
      resourceConfig: null,
      resourceRoles: 'template.system,RoleScopeCliDevelopment',
    },
    {
      atomName: 'Cli Command List',
      atomStaticKey: 'cliDefaultList',
      atomRevision: 0,
      atomCategoryId: 'a-base:function.Cli',
      resourceType: 'a-base:function',
      resourceConfig: null,
      resourceRoles: 'template.system,RoleScopeCliDevelopment',
    },
    {
      atomName: 'Cli Token',
      atomStaticKey: 'cliToken',
      atomRevision: 0,
      atomCategoryId: 'a-base:function.Cli',
      resourceType: 'a-base:function',
      resourceConfig: null,
      resourceRoles: 'template.system,RoleScopeCliDevelopment',
    },
    {
      atomName: 'Cli Tools',
      atomStaticKey: 'cliTools',
      atomRevision: 0,
      atomCategoryId: 'a-base:function.Cli',
      resourceType: 'a-base:function',
      resourceConfig: null,
      resourceRoles: 'template.system,RoleScopeCliDevelopment',
    },
    {
      atomName: 'Cli Create',
      atomStaticKey: 'cliCreate',
      atomRevision: 0,
      atomCategoryId: 'a-base:function.Cli',
      resourceType: 'a-base:function',
      resourceConfig: null,
      resourceRoles: 'template.system,RoleScopeCliDevelopment',
    },
    {
      atomName: 'Cli Store',
      atomStaticKey: 'cliStore',
      atomRevision: 0,
      atomCategoryId: 'a-base:function.Cli',
      resourceType: 'a-base:function',
      resourceConfig: null,
      resourceRoles: 'template.system,RoleScopeCliDevelopment',
    },
  ];
  // ok
  return resources;
};


/***/ }),

/***/ 232:
/***/ ((module) => {

module.exports = app => {
  const schemas = {};
  return schemas;
};


/***/ }),

/***/ 95:
/***/ ((module) => {

module.exports = app => {
  const controllers = {};
  return controllers;
};


/***/ }),

/***/ 421:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const config = __webpack_require__(76);
const locales = __webpack_require__(25);
const errors = __webpack_require__(624);

module.exports = app => {
  // aops
  const aops = __webpack_require__(224)(app);
  // beans
  const beans = __webpack_require__(187)(app);
  // routes
  const routes = __webpack_require__(825)(app);
  // controllers
  const controllers = __webpack_require__(95)(app);
  // services
  const services = __webpack_require__(214)(app);
  // models
  const models = __webpack_require__(230)(app);
  // meta
  const meta = __webpack_require__(458)(app);

  return {
    aops,
    beans,
    routes,
    controllers,
    services,
    models,
    config,
    locales,
    errors,
    meta,
  };
};


/***/ }),

/***/ 458:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = app => {
  // schemas
  const schemas = __webpack_require__(232)(app);
  // static
  const staticResources = __webpack_require__(429)(app);
  // cli commands
  const cliCommands = __webpack_require__(407)(app);
  // meta
  const meta = {
    base: {
      atoms: {},
      statics: {
        'a-base.resource': {
          items: staticResources,
        },
      },
    },
    validation: {
      validators: {},
      keywords: {},
      schemas,
    },
    cli: {
      commands: cliCommands,
    },
  };
  return meta;
};


/***/ }),

/***/ 230:
/***/ ((module) => {

module.exports = app => {
  const models = {};
  return models;
};


/***/ }),

/***/ 825:
/***/ ((module) => {

module.exports = app => {
  const routes = [];
  return routes;
};


/***/ }),

/***/ 214:
/***/ ((module) => {

module.exports = app => {
  const services = {};
  return services;
};


/***/ }),

/***/ 638:
/***/ ((module) => {

"use strict";
module.exports = require("require3");

/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 37:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(421);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=backend.js.map