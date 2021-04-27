import {env} from './env';
import {LoadingState, TaskCounter, deepMerge, warn} from './sprite';

/**
 * 可供设置的全局参数，参见setConfig
 * - NSP 默认为. ModuleName${NSP}ActionName 用于ActionName的连接
 * - MSP 默认为, 用于一个ActionHandler同时监听多个Action的连接
 * - SSRKey 默认为 meduxInitStore 用于SSR同构时传递data
 * - MutableData 默认为 false 不使用可变数据
 */
export const config: {
  NSP: string;
  MSP: string;
  MutableData: boolean;
  DepthTimeOnLoading: number;
} = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
};
/**
 * 可供设置的全局参数
 * @param _config 设置参数
 * - NSP 默认为. ModuleName${NSP}ActionName 用于ActionName的连接
 * - MSP 默认为, 用于一个ActionHandler同时监听多个Action的连接
 */
export function setConfig(_config: {NSP?: string; MSP?: string; SSRKey?: string; MutableData?: boolean; DepthTimeOnLoading?: number}) {
  _config.NSP !== undefined && (config.NSP = _config.NSP);
  _config.MSP !== undefined && (config.MSP = _config.MSP);
  _config.MutableData !== undefined && (config.MutableData = _config.MutableData);
  _config.DepthTimeOnLoading !== undefined && (config.DepthTimeOnLoading = _config.DepthTimeOnLoading);
}

/**
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
  // __moduleName__: string;
  // __actionName__: string;
  __isReducer__?: boolean;
  __isEffect__?: boolean;
  // __isHandler__?: boolean;
  __decorators__?: [
    (action: Action, moduleName: string, effectResult: Promise<any>) => any,
    null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)
  ][];
  __decoratorResults__?: any[];
  (...args: any[]): any;
}
export interface ActionHandlerList {
  [moduleName: string]: ActionHandler;
}
export interface ActionHandlerMap {
  [actionName: string]: ActionHandlerList;
}

export type ActionCreator = (...args: any[]) => Action;

export interface ActionCreatorList {
  [actionName: string]: ActionCreator;
}

export interface ActionCreatorMap {
  [moduleName: string]: ActionCreatorList;
}

export interface IModuleHandlers {
  initState: any;
  moduleName: string;
  controller: IController;
  actions: ActionCreatorList;
}

export type Dispatch = (action: Action) => void | Promise<void>;

export type State = {[moduleName: string]: {[key: string]: any}};

export interface GetState<S extends State = {}> {
  (): S;
  (moduleName: string): {[key: string]: any} | undefined;
}

export interface StoreProxy<S extends State = {}> {
  update(actionName: string, state: Partial<S>, actionData: any[]): void;
  getState: GetState<S>;
}

export interface IController<S extends State = {}> {
  setStore(store: StoreProxy<S>): void;
  dispatch: Dispatch;
  getState: GetState<S>;
  injectedModules: {[moduleName: string]: IModuleHandlers};
  prevData: {actionName: string; prevState: S};
}
export interface CoreModuleState {
  loading?: {
    [key: string]: LoadingState;
  };
}

export type Model = (controller: IController) => void | Promise<void>;

export interface CommonModule<ModuleName extends string = string> {
  default: {
    moduleName: ModuleName;
    initState: CoreModuleState;
    model: Model;
    views: {
      [key: string]: any;
    };
    actions: {
      [actionName: string]: (...args: any[]) => Action;
    };
  };
}

export type ModuleGetter = {
  [moduleName: string]: () => CommonModule | Promise<CommonModule>;
};
export interface FacadeMap {
  [moduleName: string]: {name: string; actions: ActionCreatorList; actionNames: {[key: string]: string}};
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

export const MetaData: {
  facadeMap: FacadeMap;
  clientController: IController;
  appModuleName: string;
  appViewName: string;
  moduleGetter: ModuleGetter;
  injectedModules: {[moduleName: string]: boolean};
  reducersMap: ActionHandlerMap;
  effectsMap: ActionHandlerMap;
} = {injectedModules: {}, reducersMap: {}, effectsMap: {}} as any;

function transformAction(actionName: string, handler: ActionHandler, listenerModule: string, actionHandlerMap: ActionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (actionHandlerMap[actionName][listenerModule]) {
    warn(`Action duplicate or conflict : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = handler;
}

export function injectActions(moduleName: string, handlers: ActionHandlerList) {
  const injectedModules = MetaData.injectedModules;
  if (injectedModules[moduleName]) {
    return;
  }
  injectedModules[moduleName] = true;
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];
      if (handler.__isReducer__ || handler.__isEffect__) {
        // handler.__moduleName__ = moduleName;
        // handler = bindThis(handler, handlers);
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        actionNames.split(config.MSP).forEach((actionName) => {
          actionName = actionName.trim().replace(new RegExp(`^this[${config.NSP}]`), `${moduleName}${config.NSP}`);
          const arr = actionName.split(config.NSP);
          if (arr[1]) {
            // handler.__isHandler__ = true;
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap);
          } else {
            // handler.__isHandler__ = false;
            transformAction(
              moduleName + config.NSP + actionName,
              handler,
              moduleName,
              handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap
            );
            // addModuleActionCreatorList(moduleName, actionName);
          }
        });
      }
    }
  }
  // return MetaData.facadeMap[moduleName].actions;
}

const loadings: {[moduleName: string]: TaskCounter} = {};

/**
 * 手动设置Loading状态，同一个key名的loading状态将自动合并
 * - 参见LoadingState
 * @param item 一个Promise加载项
 * @param moduleName moduleName+groupName合起来作为该加载项的key
 * @param groupName moduleName+groupName合起来作为该加载项的key
 */
export function setLoading<T extends Promise<any>>(item: T, moduleName: string = MetaData.appModuleName, groupName = 'global'): T {
  if (env.isServer) {
    return item;
  }
  const key = moduleName + config.NSP + groupName;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(config.DepthTimeOnLoading);
    loadings[key].addListener((loadingState) => {
      const controller = MetaData.clientController;
      if (controller) {
        const actions = MetaData.facadeMap[moduleName].actions[ActionTypes.MLoading];
        const action = actions({[groupName]: loadingState});
        controller.dispatch(action);
      }
    });
  }
  loadings[key].addItem(item);
  return item;
}

export function reducer(target: any, key: string, descriptor: PropertyDescriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }
  const fun = descriptor.value as ActionHandler;
  // fun.__actionName__ = key;
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
    // fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;
    if (loadingForGroupName) {
      const before = (curAction: Action, moduleName: string, promiseResult: Promise<any>) => {
        if (!env.isServer) {
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
 * 一个类方法的装饰器，用来向effect中注入before和after的钩子
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

// export function snapshotState(target: any) {
//   if (config.MutableData) {
//     return JSON.parse(JSON.stringify(target));
//   }
//   return target;
// }
