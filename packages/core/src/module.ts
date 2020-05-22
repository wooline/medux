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
  config,
  injectActions,
  isPromise,
  reducer,
} from './basic';
import {HistoryProxy, buildStore, loadModel} from './store';
import {Middleware, ReducersMapObject, Store, StoreEnhancer} from 'redux';
import {client, env, isServerEnv} from './env';
/**
 * 模块Model的数据结构，该数据由ExportModule方法自动生成
 */
export interface Model<ModelState extends BaseModelState = BaseModelState> {
  moduleName: string;
  initState: ModelState;
  /**
   * model初始化函数
   * - model初始化时会触发dispatch moduleName.Init的action，并返回执行结果
   * @param store Store的引用
   * @param options 该数据将与initState合并注入model初始状态
   * @returns 如果模块已经初始化过，不再重复初始化并返回void，否则返回Promise
   */
  (store: ModelStore, options?: any): void | Promise<void>;
}

/**
 * 模块的数据结构，该数据由ExportModule方法自动生成
 */
export interface Module<M extends Model = Model, VS extends {[key: string]: any} = {[key: string]: any}, AS extends ActionCreatorList = {}, N extends string = string> {
  default: {
    /**
     * 模块名称
     */
    moduleName: N;
    /**
     * 模块model
     */
    model: M;
    /**
     * 模块供外部使用的views
     */
    views: VS;
    /**
     * 模块可供调用的actionCreator
     */
    actions: AS;
  };
}

/**
 * 一个数据结构用来指示如何获取模块，允许同步或异步获取
 */
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

/**
 * 描述当前路由下展示了哪些views
 */
export type RouteViews<G extends ModuleGetter> = {[key in keyof G]?: MountViews<ReturnModule<G[key]>>};

/**
 * 整个Store的数据结构模型，主要分为三部分
 * - route，路由数据
 * - modules，各个模块的数据，可通过isModule辨别
 * - otherReducers，其他第三方reducers生成的数据
 */
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

/**
 * 导出Module
 * @param moduleName 模块名，不能重复
 * @param initState 模块初始状态
 * @param ActionHandles 模块的ModelHandlers类，必须继承BaseModelHandlers
 * @param views 模块需要导出给外部使用的View，若无需给外部使用可不导出
 * @returns medux定义的module标准数据结构
 */
export type ExportModule<Component> = <
  S extends BaseModelState,
  V extends {
    [key: string]: Component;
  },
  T extends BaseModelHandlers<S, any>,
  N extends string
>(
  moduleName: N,
  initState: S,
  ActionHandles: {
    new (moduleName: string, store: any): T;
  },
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
/**
 * 当model发生变化时，用来热更新model
 * - 注意通常initState发生变更时不确保热更新100%有效，此时会console警告
 * - 通常actionHandlers发生变更时热更新有效
 */
export function modelHotReplacement(moduleName: string, initState: any, ActionHandles: {new (moduleName: string, store: any): BaseModelHandlers<any, any>}) {
  const store = MetaData.clientStore;
  const prevInitState = store._medux_.injectedModules[moduleName];
  initState.isModule = true;
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
let reRender: (appView: any) => void = () => void 0;
let reRenderTimer = 0;
let appView: any = null;
/**
 * 当view发生变化时，用来热更新UI
 */
export function viewHotReplacement(moduleName: string, views: {[key: string]: any}) {
  const moduleGetter = MetaData.moduleGetter[moduleName];
  const module = moduleGetter['__module__'] as Module;
  if (module) {
    module.default.views = views;
    env.console.warn(`[HMR] @medux Updated views: ${moduleName}`);
    appView = (MetaData.moduleGetter[MetaData.appModuleName]() as Module).default.views.Main;
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
 * 导出Module，该方法为ExportModule接口的实现
 * @param moduleName 模块名，不能重复
 * @param initState 模块初始状态
 * @param ActionHandles 模块的ModelHandlers类，必须继承BaseModelHandlers
 * @param views 模块需要导出给外部使用的View，若无需给外部使用可不导出
 * @returns medux定义的module标准数据结构
 */
export const exportModule: ExportModule<any> = (moduleName, initState, ActionHandles, views) => {
  const model = (store: ModelStore, options?: any) => {
    const hasInjected = !!store._medux_.injectedModules[moduleName];
    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = initState;
      let moduleState: BaseModelState = store.getState()[moduleName];
      const handlers = new ActionHandles(moduleName, store);
      const actions = injectActions(store, moduleName, handlers as any);
      (handlers as any).actions = actions;
      const params = store._medux_.prevState.route?.data.params || {};
      if (!moduleState) {
        moduleState = initState;
        moduleState.isModule = true;
      } else {
        moduleState = {...moduleState, isHydrate: true};
      }
      const initAction = actions.Init(moduleState, params[moduleName], options);
      return store.dispatch(initAction) as any;
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
    if (initState.isHydrate) {
      return initState;
    }
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

/**
 * 将ModelHandlers变成Action Creator
 * - 该数据结构由ExportModule自动生成
 * - medux中的action通常都由此Creator自动生成
 */
export type Actions<Ins> = {[K in keyof Ins]: Ins[K] extends (...args: any[]) => any ? Handler<Ins[K]> : never};

/**
 * 通过moduleGetter获得的module可能是同步的也可能是异步的，此方法用来判断
 */
export function isPromiseModule(module: Module | Promise<Module>): module is Promise<Module> {
  return typeof module['then'] === 'function';
}
/**
 * 通过getView获得的view可能是同步的也可能是异步的，此方法用来判断
 */
export function isPromiseView<T>(moduleView: T | Promise<T>): moduleView is Promise<T> {
  return typeof moduleView['then'] === 'function';
}
/**
 * 为所有模块的modelHanders自动生成ActionCreator
 * - 注意如果环境不支持ES7 Proxy，将无法dispatch一个未经初始化的ModelAction，此时必须手动提前loadModel
 * - 参见 loadModel
 * @param moduleGetter 模块的获取方式
 */
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
/**
 * 动态获取View，与LoadView的区别是：
 * - getView仅获取view，并不渲染，与UI平台无关
 * - LoadView内部会调用getView之后会渲染View
 * - getView会自动加载并初始化该view对应的model
 */
export function getView<T>(moduleName: string, viewName: string, modelOptions?: any): T | Promise<T> {
  const moduleGetter: ModuleGetter = MetaData.moduleGetter;
  const result = moduleGetter[moduleName]();
  if (isPromiseModule(result)) {
    return result.then((module) => {
      moduleGetter[moduleName] = cacheModule(module);
      const view: T = module.default.views[viewName];
      if (isServerEnv) {
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
    cacheModule(result, moduleGetter[moduleName]);
    const view: T = result.default.views[viewName];
    if (isServerEnv) {
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

function getModuleByName(moduleName: string, moduleGetter: ModuleGetter): Promise<Module> | Module {
  const result = moduleGetter[moduleName]();
  if (isPromiseModule(result)) {
    return result.then((module) => {
      //在SSR时loadView不能出现异步，否则浏览器初轮渲染不会包括异步组件，从而导致和服务器返回不一致
      moduleGetter[moduleName] = cacheModule(module);
      return module;
    });
  } else {
    cacheModule(result, moduleGetter[moduleName]);
    return result;
  }
}
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
 * 创建Store时的选项，通过renderApp或renderSSR传入
 */
export interface StoreOptions {
  /**
   * ssr时使用的全局key，用来保存server输出的初始Data
   * - 默认为'meduxInitStore'
   */
  ssrInitStoreKey?: string;
  /**
   * 如果你需要独立的第三方reducers可以通过此注入
   * - store根节点下reducers数据和module数据，可通过isModule来区分
   */
  reducers?: ReducersMapObject;
  /**
   * redux中间件
   */
  middlewares?: Middleware[];
  /**
   * redux增强器
   */
  enhancers?: StoreEnhancer[];
  /**
   * store的初始数据
   */
  initData?: {[key: string]: any};
}
/**
 * 该方法用来创建并启动Client应用
 * - 注意该方法只负责加载Module和创建Model，具体的渲染View将通过回调执行
 * @param render 渲染View的回调函数，该回调函数可返回一个reRender的方法用来热更新UI
 * @param moduleGetter 模块的获取方式
 * @param appModuleName 模块的主入口模块名称
 * @param history 抽象的HistoryProxy实现
 * @param storeOptions store的参数，参见StoreOptions
 * @param beforeRender 渲染前的钩子，通过该钩子你可以保存或修改store
 */
export async function renderApp<V>(
  render: (store: Store<StoreState>, appModel: Model, appView: V, ssrInitStoreKey: string) => (appView: V) => void,
  moduleGetter: ModuleGetter,
  appModuleName: string,
  history: HistoryProxy,
  storeOptions: StoreOptions = {},
  beforeRender?: (store: Store<StoreState>) => Store<StoreState>
): Promise<void> {
  if (reRenderTimer) {
    env.clearTimeout(reRenderTimer);
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
  let appModule: Module | undefined = undefined;
  for (let i = 0, k = preModuleNames.length; i < k; i++) {
    const moduleName = preModuleNames[i];
    const module = await getModuleByName(moduleName, moduleGetter);
    await module.default.model(reduxStore as any, undefined);
    if (i === 0) {
      appModule = module;
    }
  }
  reRender = render(reduxStore, appModule!.default.model, appModule!.default.views.Main, ssrInitStoreKey);
}
/**
 * SSR时该方法用来创建并启动Server应用
 * - 注意该方法只负责加载Module和创建Model，具体的渲染View将通过回调执行
 * @param render 渲染View的回调函数
 * @param moduleGetter 模块的获取方式
 * @param appModuleName 模块的主入口模块名称
 * @param history 抽象的HistoryProxy实现
 * @param storeOptions store的参数，参见StoreOptions
 * @param beforeRender 渲染前的钩子，通过该钩子你可以保存或修改store
 */
export async function renderSSR<V>(
  render: (store: Store<StoreState>, appModel: Model, appView: V, ssrInitStoreKey: string) => {html: any; data: any; ssrInitStoreKey: string; store: Store},
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
