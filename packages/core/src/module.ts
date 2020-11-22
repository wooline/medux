/* eslint-disable no-await-in-loop */
import {ActionHandlerMap, MetaData, FacadeMap, CommonModule, config, ModuleGetter, ModuleStore, ModuleModel} from './basic';
import {CoreModuleHandlers, cacheModule, Module, injectActions, getModuleByName} from './inject';
import {buildStore, StoreOptions} from './store';
import {client, env} from './env';

export type ReturnModule<T> = T extends Promise<infer R> ? R : T;
// export type ModuleName<M extends CommonModule> = M['default']['moduleName'];
// export type ModuleStates<M extends CommonModule> = M['default']['initState'];
// export type ModuleViews<M extends CommonModule> = M['default']['views'];
// export type ModuleActions<M extends CommonModule> = M['default']['actions'];

// export type RootState<G extends ModuleGetter> = {[key in keyof G]?: ModuleStates<ReturnModule<ReturnType<G[key]>>>};

// export type RootActions<G extends ModuleGetter> = {[key in keyof G]: ModuleActions<ReturnModule<ReturnType<G[key]>>>};

type ModuleFacade<M extends CommonModule> = {
  name: string;
  views: M['default']['views'];
  viewName: keyof M['default']['views'];
  viewNames: {[key in keyof M['default']['views']]: string};
  viewMounted: {[key in keyof M['default']['views']]?: boolean};
  state: M['default']['initState'];
  actions: M['default']['actions'];
  actionNames: {[key in keyof M['default']['actions']]: string};
};
export type APPFacade<G extends ModuleGetter = ModuleGetter> = {[key in keyof G]: ModuleFacade<ReturnModule<ReturnType<G[key]>>>};

export type CoreAPP<G extends APPFacade = APPFacade> = {[key in keyof G]: Pick<G[key], 'name' | 'actions' | 'actionNames' | 'viewNames'>};

export type LoadView<MS extends APPFacade, Options = any, Comp = any> = <M extends keyof MS, V extends MS[M]['viewName']>(
  moduleName: M,
  viewName: V,
  options?: Options,
  loading?: Comp,
  error?: Comp
) => MS[M]['views'][V];

export function getCoreAPP(data?: {[moduleName: string]: {viewNames: {[key: string]: string}; actionNames: {[key: string]: string}}}): CoreAPP<any> {
  if (!MetaData.facadeMap) {
    if (data) {
      MetaData.facadeMap = Object.keys(data).reduce((prev, moduleName) => {
        const obj = data[moduleName];
        const actions: {[actionName: string]: any} = {};
        const actionNames: {[actionName: string]: string} = {};
        Object.keys(obj.actionNames).forEach((actionName) => {
          actions[actionName] = (...payload: any[]) => ({type: moduleName + config.NSP + actionName, payload});
          actionNames[actionName] = moduleName + config.NSP + actionName;
        });
        const viewNames: {[viewName: string]: string} = {};
        Object.keys(obj.viewNames).forEach((viewName) => {
          viewNames[viewName] = moduleName + config.VSP + viewName;
        });
        const moduleFacade = {name: moduleName, actions, actionNames, viewNames};
        prev[moduleName] = moduleFacade;
        return prev;
      }, {} as FacadeMap);
    } else {
      const cacheData = {};
      MetaData.facadeMap = new Proxy(
        {},
        {
          get(_, moduleName: string) {
            if (!cacheData[moduleName]) {
              cacheData[moduleName] = {
                name: moduleName,
                viewNames: new Proxy(
                  {},
                  {
                    get(__, viewName: string) {
                      return moduleName + config.VSP + viewName;
                    },
                  }
                ),
                actionNames: new Proxy(
                  {},
                  {
                    get(__, actionName: string) {
                      return moduleName + config.NSP + actionName;
                    },
                  }
                ),
                actions: new Proxy(
                  {},
                  {
                    get(__, actionName: string) {
                      return (...payload: any[]) => ({type: moduleName + config.NSP + actionName, payload});
                    },
                  }
                ),
              };
            }
            return cacheData[moduleName];
          },
        }
      );
    }
  }
  return MetaData.facadeMap;
}
function clearHandlers(key: string, actionHandlerMap: ActionHandlerMap) {
  for (const actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      const maps = actionHandlerMap[actionName];
      delete maps[key];
    }
  }
}
/**
 * 当model发生变化时，用来热更新model
 * - 注意通常initState发生变更时不确保热更新100%有效，此时会console警告
 * - 通常actionHandlers发生变更时热更新有效
 */
export function modelHotReplacement(moduleName: string, ActionHandles: {new (): CoreModuleHandlers}) {
  const store = MetaData.clientStore;
  const prevInitState = store._medux_.injectedModules[moduleName];
  if (prevInitState) {
    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    const handlers = new ActionHandles();
    handlers.moduleName = moduleName;
    (handlers as any).store = store;
    const actions = injectActions(store, moduleName, handlers as any);
    (handlers as any).actions = actions;
    if (JSON.stringify(prevInitState) !== JSON.stringify(handlers.initState)) {
      env.console.warn(`[HMR] @medux Updated model initState: ${moduleName}`);
    }
    env.console.log(`[HMR] @medux Updated model actionHandles: ${moduleName}`);
  }
}
let reRender: (appView: any) => void = () => undefined;
let reRenderTimer = 0;
let appView: any = null;
/**
 * 当view发生变化时，用来热更新UI
 */
export function viewHotReplacement(moduleName: string, views: {[key: string]: any}) {
  const module = MetaData.moduleGetter[moduleName]() as Module;
  if (module) {
    module.default.views = views;
    env.console.warn(`[HMR] @medux Updated views: ${moduleName}`);
    appView = (MetaData.moduleGetter[MetaData.appModuleName]() as Module).default.views[MetaData.appViewName];
    if (!reRenderTimer) {
      reRenderTimer = env.setTimeout(() => {
        reRenderTimer = 0;
        reRender(appView);
        env.console.warn(`[HMR] @medux view re rendering`);
      }, 0) as any;
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}

// export function moduleHasInjected(moduleName: string, store: Store): boolean {
//   const moduleStore: ModuleStore = store as any;
//   return !!moduleStore._medux_.injectedModules[moduleName];
// }

// function getModuleListByNames(moduleNames: string[], moduleGetter: ModuleGetter): Promise<Module[]> {
//   const preModules = moduleNames.map((moduleName) => {
//     const module = getModuleByName(moduleName, moduleGetter);
//     if (isPromiseModule(module)) {
//       return module;
//     } else {
//       return Promise.resolve(module);
//     }
//   });
//   return Promise.all(preModules);
// }

/**
 * 该方法用来创建并启动Client应用
 * - 注意该方法只负责加载Module和创建Model，具体的渲染View将通过回调执行
 * @param render 渲染View的回调函数，该回调函数可返回一个reRender的方法用来热更新UI
 * @param moduleGetter 模块的获取方式
 * @param appModuleName 模块的主入口模块名称
 * @param storeOptions store的参数，参见StoreOptions
 * @param beforeRender 渲染前的钩子，通过该钩子你可以保存或修改store
 */
export async function renderApp<V>(
  render: (store: ModuleStore, appModel: ModuleModel, appView: V, ssrInitStoreKey: string) => (appView: V) => void,
  moduleGetter: ModuleGetter,
  appModuleOrName: string | CommonModule,
  appViewName: string,
  storeOptions: StoreOptions = {},
  beforeRender: (store: ModuleStore) => void
): Promise<{store: ModuleStore}> {
  if (reRenderTimer) {
    env.clearTimeout.call(null, reRenderTimer);
    reRenderTimer = 0;
  }
  const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;
  if (typeof appModuleOrName !== 'string') {
    cacheModule(appModuleOrName);
  }
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  let initData = storeOptions.initData || {};
  if (client![ssrInitStoreKey]) {
    initData = {...initData, ...client![ssrInitStoreKey]};
  }
  const store = buildStore(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  beforeRender(store);
  const appModule = await getModuleByName(appModuleName, moduleGetter);
  await appModule.default.model(store);
  reRender = render(store, appModule!.default.model, appModule!.default.views[appViewName], ssrInitStoreKey);
  return {store};
}
/**
 * SSR时该方法用来创建并启动Server应用
 * - 注意该方法只负责加载Module和创建Model，具体的渲染View将通过回调执行
 * @param render 渲染View的回调函数
 * @param moduleGetter 模块的获取方式
 * @param appModuleName 模块的主入口模块名称
 * @param storeOptions store的参数，参见StoreOptions
 * @param beforeRender 渲染前的钩子，通过该钩子你可以保存或修改store
 */
export async function renderSSR<V>(
  render: (store: ModuleStore, appModel: ModuleModel, appView: V, ssrInitStoreKey: string) => {html: any; data: any; ssrInitStoreKey: string; store: ModuleStore},
  moduleGetter: ModuleGetter,
  appModuleName: string,
  appViewName: string,
  storeOptions: StoreOptions = {},
  beforeRender: (store: ModuleStore) => string[]
) {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  const store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const preModuleNames = beforeRender(store);
  let appModule: Module | undefined;
  await Promise.all(
    preModuleNames.map((moduleName) => {
      if (moduleGetter[moduleName]) {
        const module = moduleGetter[moduleName]() as Module;
        if (module.default.moduleName === appModuleName) {
          appModule = module;
        }
        return module.default.model(store);
      }
      return null;
    })
  );
  return render(store, appModule!.default.model, appModule!.default.views[appViewName], ssrInitStoreKey);
}
