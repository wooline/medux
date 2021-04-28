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

export function renderApp(store, preLoadModules, moduleGetter, middlewares, appModuleName = 'app', appViewName = 'main') {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;
  const controller = new Controller(middlewares);
  store.dispatch = controller.dispatch;
  controller.setStore(store);
  preLoadModules = preLoadModules.filter(item => moduleGetter[item] && item !== appModuleName);
  return async () => {
    if (reRenderTimer) {
      env.clearTimeout(reRenderTimer);
      reRenderTimer = 0;
    }

    MetaData.clientController = controller;
    await loadModel(appModuleName, controller);
    await Promise.all(preLoadModules.map(moduleName => loadModel(moduleName, controller)));
    const appModule = getModuleByName(appModuleName);
    return {
      appView: appModule.default.views[appViewName],

      setReRender(hotRender) {
        reRender = hotRender;
      }

    };
  };
}
export function ssrApp(ssr, store, preLoadModules, moduleGetter, middlewares, appModuleName = 'app', appViewName = 'main') {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;
  const controller = new Controller(middlewares);
  store.dispatch = controller.dispatch;
  controller.setStore(store);
  preLoadModules = preLoadModules.filter(item => moduleGetter[item] && item !== appModuleName);
  return async () => {
    await loadModel(appModuleName, controller);
    await Promise.all(preLoadModules.map(moduleName => loadModel(moduleName, controller)));
    const appModule = getModuleByName(appModuleName);
    controller.dispatch = defFun;
    return {
      appView: appModule.default.views[appViewName]
    };
  };
}