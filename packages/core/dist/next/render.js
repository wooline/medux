import { MetaData } from './basic';
import { cacheModule, getModuleByName, loadModel } from './inject';
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

export const createApp = function (storeCreator, render, ssr, preModules = [], moduleGetter, appModuleOrName = 'app', appViewName = 'Main') {
  const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;

  if (typeof appModuleOrName !== 'string') {
    cacheModule(appModuleOrName);
  }

  return {
    useStore(storeOptions) {
      const controller = new Controller(storeOptions.middlewares);
      const store = storeCreator(controller, storeOptions);
      return {
        store,

        async ssr(renderOptions) {
          const appModule = await getModuleByName(appModuleName);
          await Promise.all(preModules.map(moduleName => loadModel(moduleName, controller)));
          controller.dispatch = defFun;
          return ssr(store, appModule.default.views[appViewName], renderOptions);
        },

        async render(renderOptions) {
          if (reRenderTimer) {
            env.clearTimeout(reRenderTimer);
            reRenderTimer = 0;
          }

          MetaData.clientController = controller;
          const appModule = await getModuleByName(appModuleName);
          await Promise.all(preModules.map(moduleName => loadModel(moduleName, controller)));
          reRender = render(store, appModule.default.views[appViewName], renderOptions);
        }

      };
    }

  };
};