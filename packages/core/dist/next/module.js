import { MetaData, config } from './basic';
import { cacheModule, injectActions, getModuleByName } from './inject';
import { buildStore } from './store';
import { client, env } from './env';

function clearHandlers(key, actionHandlerMap) {
  for (const actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      const maps = actionHandlerMap[actionName];
      delete maps[key];
    }
  }
}

export function modelHotReplacement(moduleName, ActionHandles) {
  const store = MetaData.clientStore;
  const prevInitState = store._medux_.injectedModules[moduleName];

  if (prevInitState) {
    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    const handlers = new ActionHandles();
    handlers.moduleName = moduleName;
    handlers.store = store;
    const actions = injectActions(store, moduleName, handlers);
    handlers.actions = actions;

    if (JSON.stringify(prevInitState) !== JSON.stringify(handlers.initState)) {
      env.console.warn(`[HMR] @medux Updated model initState: ${moduleName}`);
    }

    env.console.log(`[HMR] @medux Updated model actionHandles: ${moduleName}`);
  }
}

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
export function exportActions(moduleGetter) {
  if (!MetaData.actionCreatorMap) {
    MetaData.moduleGetter = moduleGetter;
    MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce((maps, moduleName) => {
      maps[moduleName] = typeof Proxy === 'undefined' ? {} : new Proxy({}, {
        get: (target, key) => {
          return (...payload) => ({
            type: moduleName + config.NSP + key,
            payload
          });
        },
        set: () => {
          return true;
        }
      });
      return maps;
    }, {});
  }

  return MetaData.actionCreatorMap;
}
export async function renderApp(render, moduleGetter, appModuleOrName, appViewName, storeOptions = {}, beforeRender) {
  if (reRenderTimer) {
    env.clearTimeout.call(null, reRenderTimer);
    reRenderTimer = 0;
  }

  const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;

  if (typeof appModuleOrName !== 'string') {
    cacheModule(appModuleOrName);
  }

  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  let initData = storeOptions.initData || {};

  if (client[ssrInitStoreKey]) {
    initData = Object.assign({}, initData, client[ssrInitStoreKey]);
  }

  const store = buildStore(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  beforeRender(store);
  const appModule = await getModuleByName(appModuleName, moduleGetter);
  await appModule.default.model(store);
  reRender = render(store, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey);
  return {
    store
  };
}
export async function renderSSR(render, moduleGetter, appModuleName, appViewName, storeOptions = {}, beforeRender) {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  const store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const preModuleNames = beforeRender(store);
  let appModule;
  await Promise.all(preModuleNames.map(moduleName => {
    if (moduleGetter[moduleName]) {
      const module = moduleGetter[moduleName]();

      if (module.default.moduleName === appModuleName) {
        appModule = module;
      }

      return module.default.model(store);
    }

    return null;
  }));
  return render(store, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey);
}