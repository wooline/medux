import { MetaData } from './basic';
import { getModuleByName, loadModel } from './inject';
import { enhanceStore } from './store';
import { env } from './env';

let reRender = () => undefined;

let reRenderTimer = 0;
let appView = null;
export function viewHotReplacement(moduleName, views) {
  const module = MetaData.moduleGetter[moduleName]();

  if (module) {
    module.default.views = views;
    env.console.warn(`[HMR] @medux Updated views: ${moduleName}`);
    appView = MetaData.moduleGetter[MetaData.appModuleName]().default.views[MetaData.appViewName];

    if (!reRenderTimer) {
      reRenderTimer = env.setTimeout(() => {
        reRenderTimer = 0;
        reRender(appView);
        env.console.warn(`[HMR] @medux view re rendering`);
      }, 0);
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}

const defFun = () => undefined;

export function renderApp(baseStore, preLoadModules, moduleGetter, middlewares, appModuleName = 'app', appViewName = 'main') {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;

  if (!MetaData.moduleGetter) {
    MetaData.moduleGetter = moduleGetter;
  }

  const store = enhanceStore(baseStore, middlewares);
  preLoadModules = preLoadModules.filter(item => moduleGetter[item] && item !== appModuleName);
  return {
    store,

    async beforeRender() {
      if (reRenderTimer) {
        env.clearTimeout(reRenderTimer);
        reRenderTimer = 0;
      }

      MetaData.clientStore = store;
      await loadModel(appModuleName, store);
      await Promise.all(preLoadModules.map(moduleName => loadModel(moduleName, store)));
      const appModule = getModuleByName(appModuleName);
      return {
        appView: appModule.default.views[appViewName],

        setReRender(hotRender) {
          reRender = hotRender;
        }

      };
    }

  };
}
export function ssrApp(baseStore, preLoadModules, moduleGetter, middlewares, appModuleName = 'app', appViewName = 'main') {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;

  if (!MetaData.moduleGetter) {
    MetaData.moduleGetter = moduleGetter;
  }

  const store = enhanceStore(baseStore, middlewares);
  preLoadModules = preLoadModules.filter(item => moduleGetter[item] && item !== appModuleName);
  return {
    store,

    async beforeRender() {
      await loadModel(appModuleName, store);
      await Promise.all(preLoadModules.map(moduleName => loadModel(moduleName, store)));
      const appModule = getModuleByName(appModuleName);
      store.dispatch = defFun;
      return {
        appView: appModule.default.views[appViewName]
      };
    }

  };
}