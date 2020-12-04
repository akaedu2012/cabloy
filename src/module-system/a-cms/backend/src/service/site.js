const require3 = require('require3');
const extend = require3('extend2');

const _blocksLocales = {};
const _blockArrayLocales = {};

module.exports = app => {
  const moduleInfo = app.meta.mockUtil.parseInfoFromPackage(__dirname);
  class Site extends app.Service {

    async getSite({ atomClass, language, options }) {
      const build = this.ctx.bean._newBean(`${moduleInfo.relativeName}.local.build`, atomClass);
      return await build.getSite({ language, options });
    }

    async getConfigSiteBase({ atomClass }) {
      const build = this.ctx.bean._newBean(`${moduleInfo.relativeName}.local.build`, atomClass);
      return await build.getConfigSiteBase();
    }

    async getConfigSite({ atomClass }) {
      const build = this.ctx.bean._newBean(`${moduleInfo.relativeName}.local.build`, atomClass);
      return await build.getConfigSite();
    }

    // save site config
    async setConfigSite({ atomClass, data }) {
      // build
      const build = this.ctx.bean._newBean(`${moduleInfo.relativeName}.local.build`, atomClass);
      // save
      await build.setConfigSite({ data });
      // only in development
      if (this.ctx.app.meta.isLocal) {
        // build site
        this.buildLanguagesQueue({ atomClass });
        // register watchers
        await build.registerWatchers();
      }
    }

    async getConfigLanguagePreview({ atomClass, language }) {
      const build = this.ctx.bean._newBean(`${moduleInfo.relativeName}.local.build`, atomClass);
      return await build.getConfigLanguagePreview({ language });
    }

    async getConfigLanguage({ atomClass, language }) {
      const build = this.ctx.bean._newBean(`${moduleInfo.relativeName}.local.build`, atomClass);
      return await build.getConfigLanguage({ language });
    }

    // save language config
    async setConfigLanguage({ atomClass, language, data }) {
      // build
      const build = this.ctx.bean._newBean(`${moduleInfo.relativeName}.local.build`, atomClass);
      // save
      await build.setConfigLanguage({ language, data });
      // only in development
      if (this.ctx.app.meta.isLocal) {
        // build site
        this.buildLanguageQueue({ atomClass, language });
        // register watcher
        await build.registerWatcher({ language });
      }
    }

    async getLanguages({ atomClass }) {
      const build = this.ctx.bean._newBean(`${moduleInfo.relativeName}.local.build`, atomClass);
      return await build.getLanguages();
    }

    async getUrl({ atomClass, language, path }) {
      const build = this.ctx.bean._newBean(`${moduleInfo.relativeName}.local.build`, atomClass);
      const site = await build.getSite({ language });
      return build.getUrl(site, language, path);
    }

    buildLanguagesQueue({ atomClass, progressId }) {
      // queue
      this.ctx.app.meta.queue.push({
        locale: this.ctx.locale,
        subdomain: this.ctx.subdomain,
        module: moduleInfo.relativeName,
        queueName: 'render',
        queueNameSub: `${atomClass.module}:${atomClass.atomClassName}`,
        data: {
          queueAction: 'buildLanguages',
          atomClass,
          progressId,
        },
      });
    }

    buildLanguageQueue({ atomClass, language, progressId }) {
      // queue
      this.ctx.app.meta.queue.push({
        locale: this.ctx.locale,
        subdomain: this.ctx.subdomain,
        module: moduleInfo.relativeName,
        queueName: 'render',
        queueNameSub: `${atomClass.module}:${atomClass.atomClassName}`,
        data: {
          queueAction: 'buildLanguage',
          atomClass,
          language,
          progressId,
        },
      });
    }

    getBlocks({ locale }) {
      if (!locale) locale = this.ctx.locale;
      if (!_blocksLocales[locale]) {
        const blocks = this._prepareBlocks({ locale });
        // object
        _blocksLocales[locale] = blocks;
        // array order by titleLocale
        const blockArray = [];
        for (const key in blocks) {
          blockArray.push(blocks[key]);
        }
        _blockArrayLocales[locale] = blockArray.sort((a, b) => a.meta.titleLocale.localeCompare(b.meta.titleLocale, locale));
      }
      return _blocksLocales[locale];
    }

    getBlockArray({ locale }) {
      this.getBlocks({ locale });
      return _blockArrayLocales[locale];
    }

    async blockSave({ blockName, item }) {
      // block
      const blocks = this.getBlocks({ locale: this.ctx.locale });
      const block = blocks[blockName];
      // validate
      await this.ctx.bean.validation.validate({
        module: block.meta.module,
        validator: block.meta.validator,
        schema: null,
        data: item,
      });
      // output
      if (!block.data.output) return item;
      return await block.data.output({ ctx: this.ctx, block, data: item });
    }

    async getStats({ atomClass, languages }) {
      const res = {};
      for (const language of languages) {
        res[language] = await this._getStatsLanguange({ atomClass, language });
      }
      return res;
    }

    async _getStatsLanguange({ atomClass, language }) {
      const stats = {};

      // articles
      stats.articles = await this.ctx.bean.atom.count({
        atomClass,
        options: {
          where: {
            'f.language': language,
          },
          mode: 'default',
        },
      });

      // comments
      stats.comments = await this.ctx.bean.atom.count({
        atomClass,
        options: {
          where: {
            'f.language': language,
          },
          mode: 'default',
          comment: 1,
        },
      });

      // categories
      stats.categories = await this.ctx.service.category.count({
        atomClass, language,
      });

      // tags
      stats.tags = await this.ctx.service.tag.count({
        atomClass, language,
      });

      // ok
      return stats;
    }

    _prepareBlocks({ locale }) {
      const blocks = {};
      // (X) modulesArray for block override
      for (const module of this.app.meta.modulesArray) {
        if (module.main.meta && module.main.meta.cms &&
          module.main.meta.cms.plugin && module.main.meta.cms.plugin.blocks) {
          const blocksModule = this._prepareBlocksModule({ locale, module, blocks: module.main.meta.cms.plugin.blocks });
          Object.assign(blocks, blocksModule);
        }
      }
      return blocks;
    }

    _prepareBlocksModule({ locale, module, blocks }) {
      const blocksModule = {};
      const moduleName = module.info.relativeName;
      for (const key in blocks) {
        const block = blocks[key];
        const fullName = `${moduleName}:${key}`;
        blocksModule[fullName] = extend(true, {}, block, {
          meta: {
            fullName,
            module: block.meta.module || moduleName,
            titleLocale: this.ctx.text.locale(locale, block.meta.title),
          },
        });
      }
      return blocksModule;
    }

  }

  return Site;
};
