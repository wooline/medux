import { MetaData } from './basic';
import { getModuleByName, loadModel } from './inject';
import { Controller } from './store';
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

export function buildApp(storeCreator, render, ssr, preLoadModules, {
  moduleGetter,
  appModuleName = 'app',
  appViewName = 'main',
  storeOptions = {},
  renderOptions = {},
  ssrOptions = {}
}) {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;
  const controller = new Controller(storeOptions.middlewares);
  const store = storeCreator(storeOptions);
  store.dispatch = controller.dispatch;
  controller.setStore(store);
  preLoadModules = preLoadModules.filter(item => moduleGetter[item] && item !== appModuleName);
  preLoadModules.unshift(appModuleName);
  return {
    store,

    async render() {
      if (reRenderTimer) {
        env.clearTimeout(reRenderTimer);
        reRenderTimer = 0;
      }

      MetaData.clientController = controller;
      const appModule = await getModuleByName(appModuleName);
      await Promise.all(preLoadModules.map(moduleName => loadModel(moduleName, controller)));
      reRender = render(store, appModule.default.views[appViewName], renderOptions);
    },

    async ssr() {
      const appModule = await getModuleByName(appModuleName);
      await Promise.all(preLoadModules.map(moduleName => loadModel(moduleName, controller)));
      controller.dispatch = defFun;
      return ssr(store, appModule.default.views[appViewName], ssrOptions);
    }

  };
}