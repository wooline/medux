/* eslint-disable no-await-in-loop */
import {Store} from 'redux';
import {ActionHandlerMap, Module, MetaData, CoreRootState, config, ModuleGetter, ModuleModel} from './basic';
import {CoreModelHandlers, CommonModule, cacheModule, injectActions, getModuleByName} from './inject';
import {buildStore, StoreOptions} from './store';
import {client, env} from './env';

type MeduxModule<M extends any> = M['default'];
export type ReturnModule<T> = T extends () => Promise<infer R> ? MeduxModule<R> : T extends () => infer R ? MeduxModule<R> : never;
// export type ReturnViews<T extends () => any> = T extends () => Promise<Module<ModuleModel, infer R>> ? R : T extends () => Module<ModuleModel, infer R> ? R : never;
export type ModuleName<M extends any> = M['moduleName'];
export type ModuleStates<M extends any> = M['model']['initState'];
export type ModuleViews<M extends any> = M['views'];
export type ModuleActions<M extends any> = M['actions'];

/**
 * 整个Store的数据结构模型，主要分为三部分
 * - route，路由数据
 * - modules，各个模块的数据，可通过isModule辨别
 * - otherReducers，其他第三方reducers生成的数据
 */
export type RootState<G extends ModuleGetter> = {[key in keyof G]?: ModuleStates<ReturnModule<G[key]>>};

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
export function modelHotReplacement(moduleName: string, initState: any, ActionHandles: {new (moduleName: string, store: any): CoreModelHandlers<any, any>}) {
  const store = MetaData.clientStore;
  const prevInitState = store._medux_.injectedModules[moduleName];
  if (prevInitState) {
    if (JSON.stringify(prevInitState) !== JSON.stringify(initState)) {
      env.console.warn(`[HMR] @medux Updated model initState: ${moduleName}`);
    }
    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    const handlers = new ActionHandles(moduleName, store);
    const actions = injectActions(store, moduleName, handlers as any);
    (handlers as any).actions = actions;
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
//   const modelStore: ModelStore = store as any;
//   return !!modelStore._medux_.injectedModules[moduleName];
// }

/**
 * 为所有模块的modelHanders自动生成ActionCreator
 * - 注意如果环境不支持ES7 Proxy，将无法dispatch一个未经初始化的ModelAction，此时必须手动提前loadModel
 * - 参见 loadModel
 * @param moduleGetter 模块的获取方式
 */
export function exportActions<G extends ModuleGetter>(moduleGetter: G): {[key in keyof G]: ModuleActions<ReturnModule<G[key]>>} {
  MetaData.moduleGetter = moduleGetter as any;
  MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce((maps, moduleName) => {
    maps[moduleName] =
      typeof Proxy === 'undefined'
        ? {}
        : new Proxy(
            {},
            {
              get: (target: any, key: string) => {
                return (...payload: any[]) => ({type: moduleName + config.NSP + key, payload});
              },
              set: () => {
                return true;
              },
            }
          );
    return maps;
  }, {});
  return MetaData.actionCreatorMap as any;
}

/**
 * 动态加载View，因为每种UI框架动态加载View的方式不一样，所有此处只是提供一个抽象接口
 * @see getView
 */

export type LoadView<MG extends ModuleGetter, Options = any, Comp = any> = <M extends Extract<keyof MG, string>, V extends ModuleViews<ReturnModule<MG[M]>>, N extends Extract<keyof V, string>>(
  moduleName: M,
  viewName: N,
  options?: Options,
  loading?: Comp,
  error?: Comp
) => V[N];

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
  render: (store: Store<CoreRootState>, appModel: ModuleModel, appView: V, ssrInitStoreKey: string) => (appView: V) => void,
  moduleGetter: ModuleGetter,
  appModuleOrName: string | CommonModule,
  appViewName: string,
  storeOptions: StoreOptions = {},
  beforeRender?: (store: Store<CoreRootState>) => Store<CoreRootState>
): Promise<void> {
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
  let initData: CoreRootState = storeOptions.initData || {};
  if (client![ssrInitStoreKey]) {
    initData = {...initData, ...client![ssrInitStoreKey]};
  }
  const store: Store<CoreRootState> = buildStore(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers) as any;
  const reduxStore = beforeRender ? beforeRender(store) : store;
  const storeState = reduxStore.getState();
  const preModuleNames: string[] = Object.keys(storeState).filter((key) => key !== appModuleName && moduleGetter[key]);
  preModuleNames.unshift(appModuleName);
  let appModule: Module | undefined;
  for (let i = 0, k = preModuleNames.length; i < k; i++) {
    const moduleName = preModuleNames[i];
    const module = await getModuleByName(moduleName, moduleGetter);
    await module.default.model(reduxStore as any);
    if (i === 0) {
      appModule = module;
    }
  }
  reRender = render(reduxStore, appModule!.default.model, appModule!.default.views[appViewName], ssrInitStoreKey);
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
  render: (store: Store<CoreRootState>, appModel: ModuleModel, appView: V, ssrInitStoreKey: string) => {html: any; data: any; ssrInitStoreKey: string; store: Store},
  moduleGetter: ModuleGetter,
  appModuleName: string,
  appViewName: string,
  storeOptions: StoreOptions = {},
  beforeRender?: (store: Store<CoreRootState>) => Store<CoreRootState>
) {
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  const store: Store<CoreRootState> = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers) as any;
  const reduxStore = beforeRender ? beforeRender(store) : store;
  const storeState: CoreRootState = reduxStore.getState();
  const preModuleNames: string[] = Object.keys(storeState).filter((key) => key !== appModuleName && moduleGetter[key]);
  preModuleNames.unshift(appModuleName);
  let appModule: Module | undefined;
  for (let i = 0, k = preModuleNames.length; i < k; i++) {
    const moduleName = preModuleNames[i];
    const module = moduleGetter[moduleName]() as Module;
    await module.default.model(reduxStore as any);
    if (i === 0) {
      appModule = module;
    }
  }
  // const {paths} = storeState.route.data;
  // paths.length === 0 && paths.push(appModuleName);
  return render(reduxStore, appModule!.default.model, appModule!.default.views[appViewName], ssrInitStoreKey);
}
