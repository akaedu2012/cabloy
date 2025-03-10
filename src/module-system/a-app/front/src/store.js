const __appKeyDefault = 'a-app:appDefault';
const __appKeyBase = 'a-app:appBase';
const __atomClassApp = {
  module: 'a-app',
  atomClassName: 'app',
};

export default function (Vue) {
  const query = Vue.prototype.$utils.parseUrlQuery();

  Vue.prototype.$meta.eventHub.$on('auth:login', data => {
    Vue.prototype.$meta.store.commit('a/app/clearUserInfo', data);
  });

  return {
    state: {
      // user
      currentInner: {
        appKey: null,
        appLanguage: null,
      },
      appItemsAll: null,
      // layoutConfig: null, // should not cache, because maybe changed
      // global
      appItems: {},
    },
    getters: {
      current(state) {
        // appKey
        const appKey = state.currentInner.appKey;
        // appLanguage
        const appLanguage = state.currentInner.appLanguage;
        // ok
        return {
          appKey,
          appLanguage,
        };
      },
      appItemCurrent(state, getters) {
        return state.appItems[getters.current.appKey];
      },
      presetConfigCurrent(state, getters) {
        const appItem = getters.appItemCurrent;
        if (!appItem) return null;
        // preset config
        return __getPresetConfig({ Vue, appItem, current: getters.current });
      },
    },
    mutations: {
      clearUserInfo(state) {
        // clear
        // // maybe fallback to appDefault from appSystem
        // if (state.currentInner.appKey === __appKeyDefault) {
        //   state.currentInner.appKey = null;
        // }
        // for more general scenes
        state.currentInner.appKey = null;
        state.appItemsAll = null;
        //
        // state.layoutConfig = null;
      },
      setCurrent(state, { appKey, appLanguage, cb }) {
        if (!appKey && !appLanguage) return;
        if (appKey) state.currentInner.appKey = appKey;
        if (appLanguage) state.currentInner.appLanguage = appLanguage;
        // save current
        __saveCurrent({ Vue, current: state.currentInner, cb });
      },
      setAppItem(state, { appKey, appItem }) {
        state.appItems = {
          ...state.appItems,
          [appKey]: appItem,
        };
      },
      setAppItemsAll(state, { appItems }) {
        state.appItemsAll = appItems;
      },
      // setLayoutConfig(state, { layoutConfig }) {
      //   state.layoutConfig = layoutConfig;
      // },
    },
    actions: {
      async getLayoutConfig(/* { state, commit }*/) {
        // if (state.layoutConfig) return state.layoutConfig;
        const layoutConfig = await Vue.prototype.$meta.store.dispatch('a/base/getLayoutConfig', 'a-basefront');
        // commit('setLayoutConfig', { layoutConfig });
        return layoutConfig;
      },
      async getCurrent({ state, getters, commit, dispatch }) {
        // force exists
        const layoutConfig = await dispatch('getLayoutConfig');
        // current
        if (state.currentInner.appKey) {
          // has inited
          return getters.current;
        }
        // layout config
        const layoutConfigKey = __getLayoutConfigKey({ Vue });
        const layoutConfigValue = layoutConfig[layoutConfigKey] || {};
        const layoutConfigValueApp = layoutConfigValue.appKey;
        const layoutConfigValueLanguage = layoutConfigValue.appLanguage;
        // set current
        const appKey = query.appKey || layoutConfigValueApp || __appKeyDefault;
        const appLanguage = query.appLanguage || layoutConfigValueLanguage || Vue.prototype.$meta.util.getLocale();
        commit('setCurrent', { appKey, appLanguage });
        return getters.current;
      },
      async getPresetConfigCurrent({ state, getters, commit, dispatch }) {
        // force init current
        await dispatch('getCurrent');
        // force appItem exists
        const appItem = await dispatch('getAppItemCurrent');
        if (!appItem) {
          // fallback to appDefault
          commit('setCurrent', { appKey: __appKeyDefault });
          await dispatch('getAppItemCurrent');
        }
        // current
        return getters.presetConfigCurrent;
      },
      async getPresetConfigDefault({ state, dispatch }) {
        return await dispatch('getPresetConfig', { appKey: __appKeyDefault });
      },
      async getPresetConfig({ state, getters, dispatch }, { appKey }) {
        // force appItem exists
        const appItem = await dispatch('getAppItem', { appKey });
        if (!appItem) return null; // maybe no access right
        return __getPresetConfig({ Vue, appItem, current: getters.current });
      },
      async getAppItemCurrent({ state, getters, dispatch }) {
        return await dispatch('getAppItem', { appKey: getters.current.appKey });
      },
      async getAppItemDefault({ state, dispatch }) {
        return await dispatch('getAppItem', { appKey: __appKeyDefault });
      },
      async getAppItem({ state, commit, dispatch }, { appKey }) {
        let appItem = state.appItems[appKey];
        if (appItem) return appItem;
        appItem = await __fetchAppItem({ Vue, appKey });
        if (!appItem) return null; // maybe no access right
        appItem.content = appItem.content ? JSON.parse(appItem.content) : null;
        // get base app
        if (appKey !== __appKeyBase) {
          const appItemBase = await dispatch('getAppItem', { appKey: __appKeyBase });
          appItem.content = Vue.prototype.$meta.util.extend({}, appItemBase.content, appItem.content);
          // special for appIsolate
          if (query.appIsolate === 'true') {
            appItem.appIsolate = true;
          }
        }
        commit('setAppItem', { appKey, appItem });
        return appItem;
      },
      async getAppItemsAll({ state, commit }) {
        if (state.appItemsAll) return state.appItemsAll;
        const res = await Vue.prototype.$meta.api.post('/a/base/resource/select', {
          atomClass: __atomClassApp,
          options: {
            where: {
              'f.appHidden': 0,
            },
            orders: [
              ['f.appSorting', 'asc'],
              ['f.createdAt', 'asc'],
            ],
          },
        });
        const appItems = res.list;
        commit('setAppItemsAll', { appItems });
        return appItems;
      },
      async getAppMenuInfo({ state, dispatch }, { appKey }) {
        const appItem = await dispatch('getAppItem', { appKey });
        // configMenu
        const presetConfig = await dispatch('getPresetConfig', { appKey });
        const configMenu = presetConfig.menu;
        // ok
        return {
          appKey,
          appItem,
          configMenu,
          appMenuLayout: configMenu.layout,
        };
      },
      async getAppHomeInfo({ state, getters, dispatch }, { appKey, force }) {
        let appItem = await dispatch('getAppItem', { appKey });
        // configHome
        let configHome;
        const presetConfig = await dispatch('getPresetConfig', { appKey });
        configHome = presetConfig.home;
        if (!configHome.mode && force) {
          appKey = __appKeyDefault;
          const presetConfigDefault = await dispatch('getPresetConfigDefault');
          configHome = presetConfigDefault.home;
          appItem = await dispatch('getAppItemDefault');
        }
        if (!configHome.mode) return null;
        // url
        let url;
        if (configHome.mode === 'dashboard') {
          url = `/a/dashboard/dashboard?key=${configHome.dashboard}`;
        } else {
          url = configHome.page;
        }
        // for unique
        const queries = { appKey };
        if (appItem.appLanguage) {
          queries.appLanguage = getters.current.appLanguage;
        }
        url = Vue.prototype.$meta.util.combineQueries(url, queries);
        // ok
        return {
          appKey,
          appItem,
          configHome,
          url,
        };
      },
      async getAppMineInfo({ state, dispatch }, { appKey, force }) {
        let appItem = await dispatch('getAppItem', { appKey });
        // current
        let configMine;
        const presetConfig = await dispatch('getPresetConfig', { appKey });
        configMine = presetConfig.mine;
        if (!configMine.layout && force) {
          appKey = __appKeyDefault;
          const presetConfigDefault = await dispatch('getPresetConfigDefault');
          configMine = presetConfigDefault.mine;
          appItem = await dispatch('getAppItemDefault');
        }
        if (!configMine.layout) return null;
        // ok
        return {
          appKey,
          appItem,
          configMine,
          appMineLayout: configMine.layout,
        };
      },
      preloadModules(store, { appKey }) {
        const parts = appKey.split(':');
        if (parts.length === 2) {
          Vue.prototype.$meta.util.preloadModules(parts[0]);
        }
        if (Vue.prototype.$meta.vueApp.layout === 'pc') {
          Vue.prototype.$meta.util.preloadModules('a-antdv');
        }
      },
      async setCurrent({ state, commit }, { appKey, appLanguage }) {
        return new Promise((resolve, reject) => {
          commit('setCurrent', {
            appKey,
            appLanguage,
            cb: err => {
              if (err) return reject(err);
              resolve();
            },
          });
        });
      },
    },
  };
}

function __getUserStatusAndLayout({ Vue }) {
  // userStatus
  const user = Vue.prototype.$meta.store.state.auth.user;
  const userOp = user && user.op;
  const userStatus = !userOp || userOp.anonymous ? 'anonymous' : 'authenticated';
  // layout
  const layout = Vue.prototype.$meta.vueApp.layout;
  // ok
  return { userStatus, layout };
}

function __getLayoutConfigKey({ Vue }) {
  const { userStatus, layout } = __getUserStatusAndLayout({ Vue });
  return `apps.current.${userStatus}.${layout}`;
}

function __getPresetConfig({ Vue, appItem, current }) {
  const { userStatus, layout } = __getUserStatusAndLayout({ Vue });
  const presetConfig = appItem.content.presets[userStatus][layout];
  return presetConfig[current.appLanguage] || presetConfig;
}

async function __fetchAppItem({ Vue, appKey }) {
  try {
    const appItem = await Vue.prototype.$meta.api.post('/a/app/resource/read', {
      atomStaticKey: appKey,
      options: {
        //  locale: false, // should return locale info
      },
    });
    return appItem;
  } catch (err) {
    if (err.code === 401 || err.code === 403) {
      return null;
    }
    throw err;
  }
}
async function __saveCurrent({ Vue, current, cb }) {
  if (cb) {
    __saveCurrent_inner({ Vue, current })
      .then(() => {
        cb();
      })
      .catch(err => {
        cb(err);
      });
    return;
  }
  return await __saveCurrent_inner({ Vue, current });
}

async function __saveCurrent_inner({ Vue, current }) {
  // load appItem
  const appItem = await Vue.prototype.$meta.store.dispatch('a/app/getAppItem', { appKey: current.appKey });
  if (!appItem) {
    // maybe no access right for anonymous
    return;
  }
  if (current.appKey !== __appKeyDefault && appItem.appIsolate) return;
  // layout config
  const layoutConfig = await Vue.prototype.$meta.store.dispatch('a/app/getLayoutConfig');
  if (!layoutConfig) throw new Error('app current not inited');
  const layoutConfigKey = __getLayoutConfigKey({ Vue });
  const layoutConfigValue = layoutConfig[layoutConfigKey] || {};
  const layoutConfigValueApp = layoutConfigValue.appKey;
  const layoutConfigValueLanguage = layoutConfigValue.appLanguage;
  if (layoutConfigValueApp !== current.appKey || layoutConfigValueLanguage !== current.appLanguage) {
    await Vue.prototype.$meta.store.dispatch('a/base/setLayoutConfigKey', {
      module: 'a-basefront',
      key: layoutConfigKey,
      value: { appKey: current.appKey, appLanguage: current.appLanguage },
    });
  }
}
