/* eslint-disable no-await-in-loop */
import {ActionHandlerMap, MetaData, FacadeMap, CommonModule, config, ModuleGetter, ModuleStore} from './basic';
import {CoreModuleHandlers, cacheModule, Module, injectActions, getModuleByName, loadModel} from './inject';
import {buildStore, StoreOptions} from './store';
import {env} from './env';

export type ReturnModule<T> = T extends Promise<infer R> ? R : T;
// export type ModuleName<M extends CommonModule> = M['default']['moduleName'];
// export type ModuleStates<M extends CommonModule> = M['default']['initState'];
// export type ModuleViews<M extends CommonModule> = M['default']['views'];
// export type ModuleActions<M extends CommonModule> = M['default']['actions'];

// export type RootActions<G extends ModuleGetter> = {[key in keyof G]: ModuleActions<ReturnModule<ReturnType<G[key]>>>};

type ModuleFacade<M extends CommonModule> = {
  name: string;
  views: M['default']['views'];
  viewName: keyof M['default']['views'];
  state: M['default']['initState'];
  actions: M['default']['actions'];
  actionNames: {[key in keyof M['default']['actions']]: string};
};

export type RootModuleFacade<
  G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<CommonModule<N>>;
  } = ModuleGetter
> = {[K in Extract<keyof G, string>]: ModuleFacade<ReturnModule<ReturnType<G[K]>>>};

export type RootModuleActions<A extends RootModuleFacade> = {[K in keyof A]: keyof A[K]['actions']};

export type RootModuleAPI<A extends RootModuleFacade = RootModuleFacade> = {[key in keyof A]: Pick<A[key], 'name' | 'actions' | 'actionNames'>};

export type RootModuleState<A extends RootModuleFacade = RootModuleFacade> = {[key in keyof A]: A[key]['state']};

export type BaseLoadView<A extends RootModuleFacade = {}, Options extends {OnLoading?: any; OnError?: any} = {OnLoading?: any; OnError?: any}> = <
  M extends keyof A,
  V extends A[M]['viewName']
>(
  moduleName: M,
  viewName: V,
  options?: Options
) => A[M]['views'][V];

export function getRootModuleAPI<T extends RootModuleFacade = any>(data?: {[moduleName: string]: string[]}): RootModuleAPI<T> {
  if (!MetaData.facadeMap) {
    if (data) {
      MetaData.facadeMap = Object.keys(data).reduce((prev, moduleName) => {
        const arr = data[moduleName];
        const actions: {[actionName: string]: any} = {};
        const actionNames: {[actionName: string]: string} = {};
        arr.forEach((actionName) => {
          actions[actionName] = (...payload: any[]) => ({type: moduleName + config.NSP + actionName, payload});
          actionNames[actionName] = moduleName + config.NSP + actionName;
        });
        const moduleFacade = {name: moduleName, actions, actionNames};
        prev[moduleName] = moduleFacade;
        return prev;
      }, {} as FacadeMap);
    } else {
      const cacheData = {};
      MetaData.facadeMap = new Proxy(
        {},
        {
          set(target, moduleName: string, val, receiver) {
            return Reflect.set(target, moduleName, val, receiver);
          },
          get(target, moduleName: string, receiver) {
            const val = Reflect.get(target, moduleName, receiver);
            if (val !== undefined) {
              return val;
            }
            if (!cacheData[moduleName]) {
              cacheData[moduleName] = {
                name: moduleName,
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
  return MetaData.facadeMap as any;
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
    (handlers as any).moduleName = moduleName;
    (handlers as any).store = store;
    (handlers as any).actions = MetaData.facadeMap[moduleName].actions;
    injectActions(store, moduleName, handlers as any);
    // if (JSON.stringify(prevInitState) !== JSON.stringify(handlers.initState)) {
    //   env.console.warn(`[HMR] @medux Updated model initState: ${moduleName}`);
    // }
    env.console.log(`[HMR] @medux Updated model: ${moduleName}`);
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

/**
 * 该方法用来创建并启动Client应用
 * - 注意该方法只负责加载Module和创建Model，具体的渲染View将通过回调执行
 * @param render 渲染View的回调函数，该回调函数可返回一个reRender的方法用来热更新UI
 * @param moduleGetter 模块的获取方式
 * @param appModuleName 模块的主入口模块名称
 * @param storeOptions store的参数，参见StoreOptions
 * @param startup 此钩子之前为static代码，此钩子之后开始正式启动
 */
export async function renderApp<V>(
  render: (store: ModuleStore, appView: V) => (appView: V) => void,
  moduleGetter: ModuleGetter,
  appModuleOrName: string | CommonModule,
  appViewName: string,
  storeOptions: StoreOptions = {},
  startup: (store: ModuleStore) => void,
  preModules: string[]
): Promise<ModuleStore> {
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
  const store = buildStore(storeOptions.initData || {}, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  startup(store);
  const appModule = await getModuleByName(appModuleName);
  appModule.default.model(store);
  preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
  if (preModules.length) {
    // SSR时保证所有的module都已经载入
    await Promise.all(preModules.map((moduleName) => getModuleByName(moduleName)));
  }
  reRender = render(store, appModule.default.views[appViewName]);
  return store;
}
const defFun: any = () => undefined;
/**
 * SSR时该方法用来创建并启动Server应用
 * - 注意该方法只负责加载Module和创建Model，具体的渲染View将通过回调执行
 * @param render 渲染View的回调函数
 * @param moduleGetter 模块的获取方式
 * @param appModuleName 模块的主入口模块名称
 * @param storeOptions store的参数，参见StoreOptions
 * @param startup 此钩子之前为static代码，此钩子之后开始正式启动
 */
export async function renderSSR<V>(
  render: (store: ModuleStore, appView: V) => {html: any; data: any; store: ModuleStore},
  moduleGetter: ModuleGetter,
  appModuleOrName: string | CommonModule,
  appViewName: string,
  storeOptions: StoreOptions = {},
  startup: (store: ModuleStore) => void,
  preModules: string[]
) {
  const appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;
  if (typeof appModuleOrName !== 'string') {
    cacheModule(appModuleOrName);
  }
  const store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  startup(store);
  const appModule = await getModuleByName(appModuleName);
  preModules = preModules.filter((item) => moduleGetter[item] && item !== appModuleName);
  preModules.unshift(appModuleName);
  await Promise.all(preModules.map((moduleName) => loadModel(moduleName, store)));
  store.dispatch = defFun;
  return render(store, appModule.default.views[appViewName]);
}
