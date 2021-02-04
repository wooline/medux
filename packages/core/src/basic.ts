import {Unsubscribe} from 'redux';
import {deepMerge, LoadingState, TaskCountEvent, TaskCounter} from './sprite';
import {env, isServerEnv} from './env';

/**
 * 可供设置的全局参数，参见setConfig
 * - NSP 默认为. ModuleName${NSP}ActionName 用于ActionName的连接
 * - MSP 默认为, 用于一个ActionHandler同时监听多个Action的连接
 * - SSRKey 默认为 meduxInitStore 用于SSR同构时传递data
 * - MutableData 默认为 false 不使用可变数据
 * - DEVTOOLS 默认为仅开发环境，是否使用chrome reduxDevTools
 */
export const config: {
  NSP: string;
  MSP: string;
  MutableData: boolean;
  DEVTOOLS: boolean;
} = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  // @ts-ignore
  DEVTOOLS: process.env.NODE_ENV === 'development',
};
/**
 * 可供设置的全局参数
 * @param _config 设置参数
 * - NSP 默认为. ModuleName${NSP}ActionName 用于ActionName的连接
 * - MSP 默认为, 用于一个ActionHandler同时监听多个Action的连接
 */
export function setConfig(_config: {NSP?: string; MSP?: string; SSRKey?: string; MutableData?: boolean; DEVTOOLS?: boolean}) {
  _config.NSP !== undefined && (config.NSP = _config.NSP);
  _config.MSP !== undefined && (config.MSP = _config.MSP);
  _config.MutableData !== undefined && (config.MutableData = _config.MutableData);
  _config.DEVTOOLS !== undefined && (config.DEVTOOLS = _config.DEVTOOLS);
}

export function warn(str: string) {
  // @ts-ignore
  if (process.env.NODE_ENV === 'development') {
    env.console.warn(str);
  }
}

export function deepMergeState(target: any = {}, ...args: any[]) {
  if (config.MutableData) {
    return deepMerge(target, ...args);
  }
  return deepMerge({}, target, ...args);
}

export function mergeState(target: any = {}, ...args: any[]) {
  if (config.MutableData) {
    return Object.assign(target, ...args);
  }
  return Object.assign({}, target, ...args);
}

export function snapshotState(target: any) {
  if (config.MutableData) {
    return JSON.parse(JSON.stringify(target));
  }
  return target;
}

export interface CommonModule<ModuleName extends string = string> {
  default: {
    moduleName: ModuleName;
    initState: CoreModuleState;
    model: (store: ModuleStore) => void | Promise<void>;
    views: {
      [key: string]: any;
    };
    actions: {
      [actionName: string]: (...args: any[]) => Action;
    };
  };
}

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
   * 模块初始化时使用ActionType：{moduleName}.{MReInit}
   */
  MReInit: 'ReInit',
  /**
   * 全局捕获到错误时使用ActionType：{Error}
   */
  Error: `medux${config.NSP}Error`,
};

/**
 * 一个数据结构用来指示如何获取模块，允许同步或异步获取
 */
export type ModuleGetter = {
  [moduleName: string]: () => CommonModule | Promise<CommonModule>;
};
export interface FacadeMap {
  [moduleName: string]: {name: string; actions: ActionCreatorList; actionNames: {[key: string]: string}};
}
export const MetaData: {
  facadeMap: FacadeMap;
  clientStore: ModuleStore;
  appModuleName: string;
  appViewName: string;
  moduleGetter: ModuleGetter;
} = {
  appViewName: null as any,
  facadeMap: null as any,
  clientStore: null as any,
  appModuleName: null as any,
  moduleGetter: null as any,
};

export function getAppModuleName(): string {
  return MetaData.appModuleName;
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
export function setLoading<T extends Promise<any>>(item: T, moduleName: string = MetaData.appModuleName, groupName = 'global'): T {
  if (isServerEnv) {
    return item;
  }
  const key = moduleName + config.NSP + groupName;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, (e) => {
      const store = MetaData.clientStore;
      if (store) {
        const actions = MetaData.facadeMap[moduleName].actions[ActionTypes.MLoading];
        const action = actions({[groupName]: e.data});
        store.dispatch(action);
      }
    });
  }
  loadings[key].addItem(item);
  return item;
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

export type Dispatch = (action: Action) => any;

interface Store {
  dispatch(action: Action): Action | Promise<void>;
  getState(): {[key: string]: any};
  subscribe(listener: () => void): Unsubscribe;
  destroy: () => void;
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

export interface ReducerHandler extends ActionHandler {
  (payload: any): CoreModuleState;
}
export interface EffectHandler extends ActionHandler {
  (payload: any, prevRootState: CoreRootState): Promise<any>;
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

export interface ModuleStore extends Store {
  _medux_: {
    reducerMap: ReducerMap;
    effectMap: EffectMap;
    injectedModules: {[moduleName: string]: boolean | undefined};
    realtimeState: CoreRootState;
    currentState: CoreRootState;
  };
}

/**
 * 所有ModuleState的固定属性
 */
export interface CoreModuleState {
  initialized?: boolean;
  /**
   * 该模块的各种loading状态，执行effect时会自动注入loading状态
   */
  loading?: {
    [key: string]: LoadingState;
  };
}

export type CoreRootState = {
  [moduleName: string]: CoreModuleState;
};

/**
 * 模块Model的数据结构，该数据由ExportModule方法自动生成
 */
export type ModuleModel = (store: ModuleStore) => void | Promise<void>;

export interface ActionCreatorMap {
  [moduleName: string]: ActionCreatorList;
}

export interface ActionCreatorList {
  [actionName: string]: ActionCreator;
}

export type ActionCreator = (...args: any[]) => Action;

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
export function isPromise(data: any): data is Promise<any> {
  return typeof data === 'object' && typeof data.then === 'function';
}
export function isServer(): boolean {
  return isServerEnv;
}
export function serverSide<T>(callback: () => T) {
  if (isServerEnv) {
    return callback();
  }
  return undefined;
}
export function clientSide<T>(callback: () => T) {
  if (!isServerEnv) {
    return callback();
  }
  return undefined;
}
