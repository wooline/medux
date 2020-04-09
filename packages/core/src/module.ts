import {
  Action,
  ActionCreatorList,
  ActionHandler,
  ActionHandlerMap,
  BaseModelState,
  MetaData,
  ModelStore,
  RouteState,
  StoreState,
  cacheModule,
  client,
  config,
  injectActions,
  isPromise,
  reducer,
} from './basic';
import {HistoryProxy, buildStore, loadModel} from './store';
import {Middleware, ReducersMapObject, Store, StoreEnhancer} from 'redux';

export interface Model<ModelState extends BaseModelState = BaseModelState> {
  moduleName: string;
  initState: ModelState;
  (store: ModelStore, options?: any): void | Promise<void>;
}

export interface Module<M extends Model = Model, VS extends {[key: string]: any} = {[key: string]: any}, AS extends ActionCreatorList = {}, N extends string = string> {
  default: {
    moduleName: N;
    model: M;
    views: VS;
    actions: AS;
  };
}

export interface ModuleGetter {
  [moduleName: string]: () => Module | Promise<Module>;
}

type ReturnModule<T> = T extends () => Promise<infer R> ? R : T extends () => infer R ? R : never;
// export type ReturnViews<T extends () => any> = T extends () => Promise<Module<Model, infer R>> ? R : T extends () => Module<Model, infer R> ? R : never;
type ModuleName<M extends any> = M['default']['moduleName'];
type ModuleStates<M extends any> = M['default']['model']['initState'];
type ModuleParams<M extends any> = M['default']['model']['initState']['routeParams'];
type ModuleViews<M extends any> = M['default']['views'];
type ModuleActions<M extends any> = M['default']['actions'];
type MountViews<M extends any> = {[key in keyof M['default']['views']]?: boolean};

export type RouteViews<G extends ModuleGetter> = {[key in keyof G]?: MountViews<ReturnModule<G[key]>>};
export type RootState<G extends ModuleGetter, L> = {
  route: {
    location: L;
    data: {
      views: RouteViews<G>;
      params: {[key in keyof G]?: ModuleParams<ReturnModule<G[key]>>};
      stackParams: {[moduleName: string]: {[key: string]: any} | undefined}[];
      paths: string[];
    };
  };
} & {[key in keyof G]?: ModuleStates<ReturnModule<G[key]>>};

export type ExportModule<Component> = <S extends BaseModelState, V extends {[key: string]: Component}, T extends BaseModelHandlers<S, any>, N extends string>(
  moduleName: N,
  initState: S,
  ActionHandles: {new (moduleName: string, store: any): T},
  views: V
) => Module<Model<S>, V, Actions<T>, N>['default'];

function clearHandlers(key: string, actionHandlerMap: ActionHandlerMap) {
  for (const actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      const maps = actionHandlerMap[actionName];
      delete maps[key];
    }
  }
}
export function modelHotReplacement(moduleName: string, initState: any, ActionHandles: {new (moduleName: string, store: any): BaseModelHandlers<any, any>}) {
  const store = MetaData.clientStore;
  const prevInitState = store._medux_.injectedModules[moduleName];
  initState.isModule = true;
  if (prevInitState) {
    if (JSON.stringify(prevInitState) !== JSON.stringify(initState)) {
      console.warn(`[HMR] @medux Updated model initState: ${moduleName}`);
    }
    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    const handlers = new ActionHandles(moduleName, store);
    const actions = injectActions(store, moduleName, handlers as any);
    (handlers as any).actions = actions;
    console.log(`[HMR] @medux Updated model actionHandles: ${moduleName}`);
  }
}
let reRender: (appView: any) => void = () => void 0;
let reRenderTimer = 0;
let appView: any = null;

export function viewHotReplacement(moduleName: string, views: {[key: string]: any}) {
  const moduleGetter = MetaData.moduleGetter[moduleName];
  const module = moduleGetter['__module__'] as Module;
  if (module) {
    module.default.views = views;
    console.warn(`[HMR] @medux Updated views: ${moduleName}`);
    appView = (MetaData.moduleGetter[MetaData.appModuleName]() as Module).default.views.Main;
    if (!reRenderTimer) {
      reRenderTimer = setTimeout(() => {
        reRenderTimer = 0;
        reRender(appView);
        console.warn(`[HMR] @medux view re rendering`);
      }, 0) as any;
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}
export const exportModule: ExportModule<any> = (moduleName, initState, ActionHandles, views) => {
  const model = (store: ModelStore, options?: any) => {
    const hasInjected = !!store._medux_.injectedModules[moduleName];
    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = initState;
      const moduleState: BaseModelState = store.getState()[moduleName];
      const handlers = new ActionHandles(moduleName, store);
      const actions = injectActions(store, moduleName, handlers as any);
      (handlers as any).actions = actions;
      if (!moduleState) {
        const params = store._medux_.prevState.route?.data.params || {};
        initState.isModule = true;
        const initAction = actions.Init(initState, params[moduleName], options);
        return store.dispatch(initAction) as any;
      }
    }
    return void 0;
  };
  model.moduleName = moduleName;
  model.initState = initState;
  const actions = {} as any;
  return {
    moduleName,
    model,
    views,
    actions,
  };
};
/**
 * ModelHandlers基类
 * 所有ModelHandlers必须继承此基类
 */
export abstract class BaseModelHandlers<S extends BaseModelState, R extends {route: RouteState}> {
  /**
   * - 引用本module的actions
   * - this.actions相当于actions[this.moduleName]
   */
  protected readonly actions: Actions<this>;

  /**
   * 构造函数的参数将由框架自动传入
   * @param moduleName 模块名称，不能重复
   * @param store 全局单例Store的引用
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(protected readonly moduleName: string, protected readonly store: ModelStore) {
    this.actions = null as any;
  }

  /**
   * 获取本Model的state
   */
  protected get state(): S {
    return this.getState();
  }
  /**
   * ie8不支持getter专用
   */
  protected getState(): S {
    return this.store._medux_.prevState[this.moduleName] as S;
  }
  /**
   * 获取整个store的state
   */
  protected get rootState(): R {
    return this.getRootState();
  }
  /**
   * ie8不支持getter专用
   */
  protected getRootState(): R {
    return this.store._medux_.prevState as any;
  }
  /**
   * - 获取本Model的实时state，通常在reducer中使用，当一个action引起多个不同模块reducer执行时：
   * - state会等到所有模块的reducer更新完成时才变化
   * - currentState是实时更新变化
   */
  protected get currentState(): S {
    return this.getCurrentState();
  }
  /**
   * ie8不支持getter专用
   */
  protected getCurrentState(): S {
    return this.store._medux_.currentState[this.moduleName] as S;
  }
  /**
   * 获取整个store的实时state，通常在reducer中使用，当一个action引起多个不同模块reducer执行时：
   * - state会等到所有模块的reducer更新完成时才变化
   * - currentState是实时更新变化
   */
  protected get currentRootState(): R {
    return this.getCurrentRootState();
  }
  /**
   * ie8不支持getter专用
   */
  protected getCurrentRootState(): R {
    return this.store._medux_.currentState as any;
  }
  /**
   * 获取本Model的前state状态，通常在effect中使用，当一个action同时引起reducer和effect执行时：
   * - 所有reducer会先执行完毕并更新rootState
   * - 之后才开始执行effect，此时effect中取到的rootState已经被reducer变更了
   * - 使用prevState可以取到reducer变更之前的state
   */
  protected get prevState(): undefined | S {
    return this.getPrevState();
  }
  /**
   * ie8不支持getter专用
   */
  protected getPrevState(): undefined | S {
    return this.store._medux_.beforeState[this.moduleName] as S;
  }
  /**
   * 获整个store的前state状态，通常在effect中使用，
   * 当一个action同时引起reducer和effect执行时：
   * - 所有reducer会先执行完毕并更新rootState
   * - 之后才开始执行effect，此时effect中取到的rootState已经被reducer变更了
   * - 使用prevState可以取到reducer变更之前的state
   */
  protected get prevRootState(): R {
    return this.getPrevRootState();
  }
  /**
   * ie8不支持getter专用
   */
  protected getPrevRootState(): R {
    return this.store._medux_.beforeState as any;
  }
  /**
   * store.dispatch的引用
   */
  protected dispatch(action: Action): Action | Promise<void> {
    return this.store.dispatch(action) as any;
  }
  /**
   * 对于某些仅供本模块内部使用的action，限制非public不对外开放.
   * 所以即使this.actions也调用不到，此时可以使用callThisAction.
   * ```
   * this.dispatch(this.callThisAction(this.anyPrivateHandle, args1, args2));
   * ```
   */
  protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {type: string; payload?: any[]} {
    const actions = MetaData.actionCreatorMap[this.moduleName];
    return actions[(handler as ActionHandler).__actionName__](...rest);
  }
  /**
   * 一个快捷操作，相当于
   * ```
   * this.dispatch(this.actions.Update({...this.state,...args}));
   * ```
   */
  protected updateState(payload: Partial<S>) {
    this.dispatch(this.callThisAction(this.Update, {...this.getState(), ...payload}));
  }
  /**
   * 动态加载并初始化其他模块的model
   */
  protected loadModel(moduleName: string, options?: any) {
    return loadModel(moduleName, this.store, options);
  }
  /**
   * - 模块被加载并初始化时将触发‘moduleName.Init’的action
   * - 此方法为该action的默认reducerHandler，通常用来注入初始化moduleState
   */
  @reducer
  protected Init(initState: S, routeParams?: any, options?: any): S {
    return {...initState, routeParams: routeParams || initState.routeParams, ...options};
  }
  /**
   * 通用的reducerHandler，通常用来更新moduleState
   */
  @reducer
  protected Update(payload: S): S {
    return payload;
  }
  /**
   * - 路由发生变化时如果路由中有该模块的routeParams，框架将自动为各个模块派发‘moduleName.RouteParams’的action
   * - 此方法为该action的默认reducerHandler，通常用来在moduleState中注入路由参数
   */
  @reducer
  public RouteParams(payload: {[key: string]: any}): S {
    const state = this.getState();
    return {
      ...state,
      routeParams: payload,
    };
  }
  /**
   * - effect异步执行时，将自动派发‘moduleName.Loading’的action
   * - 此方法为该action的默认reducerHandler，通常用来在moduleState中注入loading状态
   */
  @reducer
  protected Loading(payload: {[group: string]: string}): S {
    const state = this.getState();
    return {
      ...state,
      loading: {...state.loading, ...payload},
    };
  }
}

type Handler<F> = F extends (...args: infer P) => any
  ? (
      ...args: P
    ) => {
      type: string;
    }
  : never;

export type Actions<Ins> = {[K in keyof Ins]: Ins[K] extends (...args: any[]) => any ? Handler<Ins[K]> : never};

export function isPromiseModule(module: Module | Promise<Module>): module is Promise<Module> {
  return typeof module['then'] === 'function';
}
export function isPromiseView<T>(moduleView: T | Promise<T>): moduleView is Promise<T> {
  return typeof moduleView['then'] === 'function';
}

export function exportActions<G extends {[N in keyof G]: N extends ModuleName<ReturnModule<G[N]>> ? G[N] : never}>(moduleGetter: G): {[key in keyof G]: ModuleActions<ReturnModule<G[key]>>} {
  MetaData.moduleGetter = moduleGetter as any;
  MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce((maps, moduleName) => {
    maps[moduleName] =
      typeof Proxy === 'undefined'
        ? {}
        : new Proxy(
            {},
            {
              get: (target: {}, key: string) => {
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

export function getView<T>(moduleName: string, viewName: string, modelOptions?: any): T | Promise<T> {
  const moduleGetter: ModuleGetter = MetaData.moduleGetter;
  const result = moduleGetter[moduleName]();
  if (isPromiseModule(result)) {
    return result.then((module) => {
      moduleGetter[moduleName] = cacheModule(module);
      const view: T = module.default.views[viewName];
      if (MetaData.isServer) {
        return view;
      }
      const initModel = module.default.model(MetaData.clientStore, modelOptions);
      if (isPromise(initModel)) {
        return initModel.then(() => view);
      } else {
        return view;
      }
    });
  } else {
    const view: T = result.default.views[viewName];
    if (MetaData.isServer) {
      return view;
    }
    const initModel = result.default.model(MetaData.clientStore, modelOptions);
    if (isPromise(initModel)) {
      return initModel.then(() => view);
    } else {
      return view;
    }
  }
}

export type LoadView<MG extends ModuleGetter, Options = any, Comp = any> = <M extends Extract<keyof MG, string>, V extends ModuleViews<ReturnModule<MG[M]>>, N extends Extract<keyof V, string>>(
  moduleName: M,
  viewName: N,
  options?: Options,
  loading?: Comp,
  error?: Comp
) => V[N];

function getModuleByName(moduleName: string, moduleGetter: ModuleGetter): Promise<Module> | Module {
  const result = moduleGetter[moduleName]();
  if (isPromiseModule(result)) {
    return result.then((module) => {
      //在SSR时loadView不能出现异步，否则浏览器初轮渲染不会包括异步组件，从而导致和服务器返回不一致
      moduleGetter[moduleName] = cacheModule(module);
      return module;
    });
  } else {
    return result;
  }
}
function getModuleListByNames(moduleNames: string[], moduleGetter: ModuleGetter): Promise<Module[]> {
  const preModules = moduleNames.map((moduleName) => {
    const module = getModuleByName(moduleName, moduleGetter);
    if (isPromiseModule(module)) {
      return module;
    } else {
      return Promise.resolve(module);
    }
  });
  return Promise.all(preModules);
}
export interface StoreOptions {
  ssrInitStoreKey?: string;
  reducers?: ReducersMapObject;
  middlewares?: Middleware[];
  enhancers?: StoreEnhancer[];
  initData?: {[key: string]: any};
}

export function renderApp<V>(
  render: (store: Store<StoreState>, appModel: Model, appView: V, ssrInitStoreKey: string) => (appView: V) => void,
  moduleGetter: ModuleGetter,
  appModuleName: string,
  history: HistoryProxy,
  storeOptions: StoreOptions = {},
  beforeRender?: (store: Store<StoreState>) => Store<StoreState>
): Promise<void> {
  if (reRenderTimer) {
    clearTimeout(reRenderTimer);
    reRenderTimer = 0;
  }
  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  let initData = {};
  if (storeOptions.initData || client![ssrInitStoreKey]) {
    initData = {...client![ssrInitStoreKey], ...storeOptions.initData};
  }
  const store: Store<StoreState> = buildStore(history, initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers) as any;
  const reduxStore = beforeRender ? beforeRender(store) : store;
  const preModuleNames: string[] = [appModuleName];
  if (initData) {
    preModuleNames.push(...Object.keys(initData).filter((key) => key !== appModuleName && initData[key].isModule));
  }
  // 在ssr时，client必须在第一次render周期中完成和ssr一至的输出结构，所以不能出现异步模块
  return getModuleListByNames(preModuleNames, moduleGetter).then(([appModule]) => {
    const initModel = appModule.default.model(reduxStore as any, undefined);
    appView = appModule.default.views.Main;
    reRender = render(reduxStore, appModule.default.model, appView, ssrInitStoreKey);
    return initModel;
  });
}

export async function renderSSR<V>(
  render: (store: Store<StoreState>, appModel: Model, appViews: V, ssrInitStoreKey: string) => {html: any; data: any; ssrInitStoreKey: string; store: Store},
  moduleGetter: ModuleGetter,
  appModuleName: string,
  history: HistoryProxy,
  storeOptions: StoreOptions = {},
  beforeRender?: (store: Store<StoreState>) => Store<StoreState>
) {
  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  const store: Store<StoreState> = buildStore(history, storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers) as any;
  const reduxStore = beforeRender ? beforeRender(store) : store;
  const storeState = reduxStore.getState();
  const {paths} = storeState.route.data;
  paths.length === 0 && paths.push(appModuleName);
  let appModule: Module | undefined = undefined;
  const inited: {[moduleName: string]: boolean} = {};
  for (let i = 0, k = paths.length; i < k; i++) {
    const [moduleName] = paths[i].split(config.VSP);
    if (!inited[moduleName]) {
      inited[moduleName] = true;
      const module = moduleGetter[moduleName]() as Module;
      await module.default.model(reduxStore as any, undefined);
      if (i === 0) {
        appModule = module;
      }
    }
  }
  return render(reduxStore, appModule!.default.model, appModule!.default.views.Main, ssrInitStoreKey);
}
