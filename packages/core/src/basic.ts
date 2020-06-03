import {LoadingState, TaskCountEvent, TaskCounter} from './sprite';
import {env, isServerEnv} from './env';

import {ModuleGetter} from './module';
import {Unsubscribe} from 'redux';

export function isServer(): boolean {
  return isServerEnv;
}

const loadings: {[moduleName: string]: TaskCounter} = {};

let depthTime = 2;

/**
 * 设置深度加载的时间阀值
 * @param second 超过多少秒进入深度加载，默认为2秒
 */
export function setLoadingDepthTime(second: number) {
  depthTime = second;
}
/**
 * 手动设置Loading状态，同一个key名的loading状态将自动合并
 * - 参见LoadingState
 * @param item 一个Promise加载项
 * @param moduleName moduleName+groupName合起来作为该加载项的key
 * @param groupName moduleName+groupName合起来作为该加载项的key
 */
export function setLoading<T extends Promise<any>>(item: T, moduleName: string = MetaData.appModuleName, groupName: string = 'global'): T {
  if (isServerEnv) {
    return item;
  }
  const key = moduleName + config.NSP + groupName;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, (e) => {
      const store = MetaData.clientStore;
      if (store) {
        const actions = MetaData.actionCreatorMap[moduleName][ActionTypes.MLoading];
        const action = actions({[groupName]: e.data});
        store.dispatch(action);
      }
    });
  }
  loadings[key].addItem(item);
  return item;
}

/**
 * 可供设置的全局参数，参见setConfig
 * - NSP 默认为. ModuleName${NSP}ActionName 用于ActionName的连接
 * - VSP 默认为. ModuleName${VSP}ViewName 用于路由ViewName的连接
 * - MSP 默认为, 用于一个ActionHandler同时监听多个Action的连接
 */
export const config: {
  NSP: string;
  VSP: string;
  MSP: string;
} = {
  NSP: '.',
  VSP: '.',
  MSP: ',',
};
/**
 * 可供设置的全局参数
 * @param _config 设置参数
 * - NSP 默认为. ModuleName${NSP}ActionName 用于ActionName的连接
 * - VSP 默认为. ModuleName${VSP}ViewName 用于路由ViewName的连接
 * - MSP 默认为, 用于一个ActionHandler同时监听多个Action的连接
 */
export function setConfig(_config: {NSP?: string; VSP?: string; MSP?: string}) {
  _config.NSP && (config.NSP = _config.NSP);
  _config.VSP && (config.VSP = _config.VSP);
  _config.MSP && (config.MSP = _config.MSP);
}
export const MetaData: {
  actionCreatorMap: ActionCreatorMap;
  clientStore: ModelStore;
  appModuleName: string;
  moduleGetter: ModuleGetter;
} = {
  actionCreatorMap: null as any,
  clientStore: null as any,
  appModuleName: null as any,
  moduleGetter: null as any,
};
/**
 * 框架内置的几个ActionTypes
 */
export const ActionTypes = {
  /**
   * 为模块注入加载状态时使用ActionType：{moduleName}.{MLoading}
   */
  MLoading: 'Loading',
  /**
   * 模块初始化时使用ActionType：{moduleName}.{MInit}
   */
  MInit: 'Init',
  /**
   * 模块存放在路由中的参数发生变化时使用ActionType：{moduleName}.{MRouteParams}
   */
  MRouteParams: 'RouteParams',
  /**
   * 全局捕获到错误时使用ActionType：{Error}
   */
  Error: `medux${config.NSP}Error`,
  /**
   * 全局路由发生变化时使用ActionType：{RouteChange}
   */
  RouteChange: `medux${config.NSP}RouteChange`,
};

export interface ActionCreatorMap {
  [moduleName: string]: ActionCreatorList;
}
export interface ActionCreatorList {
  [actionName: string]: ActionCreator;
}
export type ActionCreator = (...args: any[]) => Action;
interface Store {
  dispatch(action: Action): Action | Promise<void>;
  getState(): {[key: string]: any};
  subscribe(listener: () => void): Unsubscribe;
}
export interface ModelStore extends Store {
  _medux_: {
    reducerMap: ReducerMap;
    effectMap: EffectMap;
    injectedModules: {[moduleName: string]: {}};
    beforeState: StoreState;
    prevState: StoreState;
    currentState: StoreState;
    destroy: () => void;
  };
}
/**
 * 框架内部使用的路由数据结构
 * - 用户需要通过HistoryProxy将宿主的路由数据结构转换为此数据结构
 */
export interface RouteData {
  /**
   * 表示当前路由下加载了哪些views
   */
  views: DisplayViews;
  /**
   * 表示当前路由传递了哪些参数
   */
  params: {[moduleName: string]: {[key: string]: any} | undefined};
  /**
   * 表示当前路由下加载views的父子嵌套关系
   */
  paths: string[];
  /**
   * 如果存在多个路由栈（如APP）每个路由栈上分别保存什么数据
   */
  stackParams: {[moduleName: string]: {[key: string]: any} | undefined}[];
}
/**
 * Redux中保存的路由数据结构
 */
export interface RouteState<L = any> {
  /**
   * 宿主的原始路由数据结构
   */
  location: L;
  /**
   * medux使用的路由数据结构，通常它由HistoryProxy转换而来
   */
  data: RouteData;
}
/**
 * medux使用的Store数据模型结构
 */
export type StoreState = {
  [moduleName: string]: BaseModelState;
} & {route: RouteState};

/**
 * 描述当前路由展示了哪些模块的哪些view，例如：
 * ```
 * {
 *    app: {
 *        Main: true,
 *        List: true
 *    },
 *    article: {
 *        Details: true
 *    }
 * }
 * ```
 */
export interface DisplayViews {
  [moduleName: string]: {[viewName: string]: boolean | undefined} | undefined;
}

export interface ReducerHandler extends ActionHandler {
  (payload: any): BaseModelState;
}
export interface EffectHandler extends ActionHandler {
  (payload: any, prevRootState: StoreState): Promise<any>;
}
export interface ActionHandlerList {
  [actionName: string]: ActionHandler;
}
export interface ActionHandlerMap {
  [actionName: string]: {[moduleName: string]: ActionHandler};
}
export interface ReducerMap extends ActionHandlerMap {
  [actionName: string]: {[moduleName: string]: ReducerHandler};
}
export interface EffectMap extends ActionHandlerMap {
  [actionName: string]: {[moduleName: string]: EffectHandler};
}
/**
 * Medux自动创建的action载体，比redux的action载体多一个priority属性
 *
 * 因为一个action可以触发多个模块的actionHandler，priority属性用来设置handlers的优先处理顺序，通常无需设置
 */
export interface Action {
  type: string;
  /**
   * priority属性用来设置handlers的优先处理顺序，值为moduleName[]
   */
  priority?: string[];
  payload?: any[];
}
export interface ActionHandler {
  __actionName__: string;
  __isReducer__?: boolean;
  __isEffect__?: boolean;
  __isHandler__?: boolean;
  __decorators__?: [(action: Action, moduleName: string, effectResult: Promise<any>) => any, null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)][];
  __decoratorResults__?: any[];
  (payload?: any): any;
}

export interface CommonModule {
  default: {
    moduleName: string;
    model: {
      moduleName: string;
      initState: any;
      (store: any, options?: any): void | Promise<void>;
    };
    views: {[key: string]: any};
    actions: {
      [actionName: string]: (...args: any[]) => Action;
    };
  };
}

export function cacheModule<T extends CommonModule>(module: T): () => T {
  const moduleName = module.default.moduleName;
  const moduleGetter: ModuleGetter = MetaData.moduleGetter;
  let fn = moduleGetter[moduleName] as any;
  if (fn['__module__'] === module) {
    return fn;
  } else {
    fn = () => module;
    fn['__module__'] = module;
    return fn;
  }
}
/**
 * 所有ModuleState的固定属性
 */
export interface BaseModelState<R = {[key: string]: any}> {
  /**
   * 因为rootState节点下可能存在各个moduleState，也可能存在其他reducers
   * - isModule用来标识该节点是一个moduleState，该标识由框架自动生成
   */
  isModule?: boolean;
  /**
   * 如果存在预置数据(SSR)，该值为true
   */
  isHydrate?: boolean;
  /**
   * 由该模块抽离出的路由信息状态
   */
  routeParams?: R;
  /**
   * 该模块的各种loading状态，执行effect时会自动注入loading状态
   */
  loading?: {
    [key: string]: LoadingState;
  };
}

export function isPromise(data: any): data is Promise<any> {
  return typeof data === 'object' && typeof data['then'] === 'function';
}
/**
 * 在client中运行时，全局只有一个单例的Store对象，可通过该方法直接获得
 */
export function getClientStore() {
  return MetaData.clientStore;
}

/**
 * 一个类方法的装饰器，用来指示该方法为一个reducerHandler
 * - reducerHandler必须通过dispatch Action来触发
 */
export function reducer(target: any, key: string, descriptor: PropertyDescriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }
  const fun = descriptor.value as ActionHandler;
  fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
/**
 * 一个类方法的装饰器，用来指示该方法为一个effectHandler
 * - effectHandler必须通过dispatch Action来触发
 * @param loadingForGroupName 注入加载状态的分组key，默认为global，如果为null表示不注入加载状态
 * @param loadingForModuleName 可将loading状态合并注入到其他module，默认为入口主模块
 *
 * ```
 * effect(null) 不注入加载状态
 * effect() == effect('global','app')
 * effect('global') = effect('global',thisModuleName)
 * ```
 */
export function effect(loadingForGroupName?: string | null, loadingForModuleName?: string) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = MetaData.appModuleName || '';
  }
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun = descriptor.value as ActionHandler;
    fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;
    if (loadingForGroupName) {
      const before = (curAction: Action, moduleName: string, promiseResult: Promise<any>) => {
        if (!isServerEnv) {
          if (loadingForModuleName === '') {
            loadingForModuleName = MetaData.appModuleName;
          } else if (!loadingForModuleName) {
            loadingForModuleName = moduleName;
          }
          setLoading(promiseResult, loadingForModuleName, loadingForGroupName as string);
        }
      };
      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }
      fun.__decorators__.push([before, null]);
    }
    return target.descriptor === descriptor ? target : descriptor;
  };
}
/**
 * 一个类方法的装饰器，用来向reducerHandler或effectHandler中注入before和after的钩子
 * - 注意不管该handler是否执行成功，前后钩子都会强制执行
 * @param before actionHandler执行前的钩子
 * @param after actionHandler执行后的钩子
 */
export function logger(
  before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void,
  after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)
) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun: ActionHandler = descriptor.value;
    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }
    fun.__decorators__.push([before, after]);
  };
}
/**
 * 一个类方法的装饰器，将其延迟执行
 * - 可用来装饰effectHandler
 * - 也可以装饰其他类
 * @param second 延迟秒数
 */
export function delayPromise(second: number) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun = descriptor.value;
    descriptor.value = (...args: any[]) => {
      const delay = new Promise((resolve) => {
        env.setTimeout(() => {
          resolve(true);
        }, second * 1000);
      });
      return Promise.all([delay, fun.apply(target, args)]).then((items) => {
        return items[1];
      });
    };
  };
}
export function isProcessedError(error: any): boolean | undefined {
  if (typeof error !== 'object' || error.meduxProcessed === undefined) {
    return undefined;
  } else {
    return !!error.meduxProcessed;
  }
}
export function setProcessedError(error: any, meduxProcessed: boolean): {meduxProcessed: boolean; [key: string]: any} {
  if (typeof error === 'object') {
    error.meduxProcessed = meduxProcessed;
    return error;
  } else {
    return {
      meduxProcessed,
      error,
    };
  }
}
function bindThis(fun: ActionHandler, thisObj: any) {
  const newFun = fun.bind(thisObj);
  Object.keys(fun).forEach((key) => {
    newFun[key] = fun[key];
  });

  return newFun as ActionHandler;
}
function transformAction(actionName: string, action: ActionHandler, listenerModule: string, actionHandlerMap: ActionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error(`Action duplicate or conflict : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = action;
}

function addModuleActionCreatorList(moduleName: string, actionName: string) {
  const actions = MetaData.actionCreatorMap[moduleName];
  if (!actions[actionName]) {
    actions[actionName] = (...payload: any[]) => ({type: moduleName + config.NSP + actionName, payload});
  }
}
export function injectActions(store: ModelStore, moduleName: string, handlers: ActionHandlerList) {
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      let handler = handlers[actionNames];
      if (handler.__isReducer__ || handler.__isEffect__) {
        handler = bindThis(handler, handlers);
        actionNames.split(config.MSP).forEach((actionName) => {
          actionName = actionName.trim().replace(new RegExp(`^this\[${config.NSP}]`), `${moduleName}${config.NSP}`);
          const arr = actionName.split(config.NSP);
          if (arr[1]) {
            handler.__isHandler__ = true;
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
          } else {
            handler.__isHandler__ = false;
            transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
            addModuleActionCreatorList(moduleName, actionName);
          }
        });
      }
    }
  }
  return MetaData.actionCreatorMap[moduleName];
}
