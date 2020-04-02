/*global global:true process:true*/
import {LoadingState, TaskCountEvent, TaskCounter} from './sprite';

import {ModuleGetter} from './module';

// export const root: {__REDUX_DEVTOOLS_EXTENSION__?: any; __REDUX_DEVTOOLS_EXTENSION__OPTIONS?: any; onerror: any; onunhandledrejection: any} = ((typeof self == 'object' &&
//   self.self === self &&
//   self) ||
//   (typeof global == 'object' && global.global === global && global) ||
//   this) as any;

const loadings: {[moduleName: string]: TaskCounter} = {};

let depthTime = 2;

export function setLoadingDepthTime(second: number) {
  depthTime = second;
}
export function setLoading<T extends Promise<any>>(item: T, moduleName: string = MetaData.appModuleName, group: string = 'global'): T {
  if (MetaData.isServer) {
    return item;
  }
  const key = moduleName + config.NSP + group;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, (e) => {
      const store = MetaData.clientStore;
      if (store) {
        const actions = MetaData.actionCreatorMap[moduleName][ActionTypes.MLoading];
        const action = actions({[group]: e.data});
        store.dispatch(action);
      }
    });
  }
  loadings[key].addItem(item);
  return item;
}

export const config: {
  NSP: string; //ModuleName${NSP}ActionName用于ActionName
  VSP: string; //ModuleName${VSP}ViewName用于路由
  MSP: string; //用于同时监听多个Action
} = {
  NSP: '/',
  VSP: '.',
  MSP: ',',
};
export function setConfig(_config: {NSP?: string; VSP?: string; MSP?: string}) {
  _config.NSP && (config.NSP = _config.NSP);
  _config.VSP && (config.VSP = _config.VSP);
  _config.MSP && (config.MSP = _config.MSP);
}
export const MetaData: {
  isServer: boolean;
  isDev: boolean;
  actionCreatorMap: ActionCreatorMap;
  clientStore: ModelStore;
  appModuleName: string;
  moduleGetter: ModuleGetter;
} = {
  isServer: typeof global !== 'undefined' && typeof window === 'undefined',
  isDev: process.env.NODE_ENV !== 'production',
  actionCreatorMap: null as any,
  clientStore: null as any,
  appModuleName: null as any,
  moduleGetter: null as any,
};

export const ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteParams: 'RouteParams',
  Error: `medux${config.NSP}Error`,
  RouteChange: `medux${config.NSP}RouteChange`,
};
export const client: Window | undefined = MetaData.isServer ? undefined : typeof window === 'undefined' ? (global as any) : window;
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
  subscribe(listener: () => void): void;
}
export interface ModelStore extends Store {
  _medux_: {
    reducerMap: ReducerMap;
    effectMap: EffectMap;
    injectedModules: {[moduleName: string]: {}};
    beforeState: StoreState;
    prevState: StoreState;
    currentState: StoreState;
  };
}
export interface RouteData {
  views: DisplayViews;
  params: {[moduleName: string]: {[key: string]: any} | undefined};
  paths: string[];
  stackParams: {[moduleName: string]: {[key: string]: any} | undefined}[];
}
export interface RouteState<L = any> {
  location: L;
  data: RouteData;
}
export type StoreState = {
  [moduleName: string]: BaseModelState;
} & {route: RouteState};

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
export interface Action {
  type: string;
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
export interface BaseModelState<R = {[key: string]: any}> {
  isModule?: boolean;
  routeParams?: R;
  loading?: {
    [key: string]: LoadingState;
  };
}

export function isPromise(data: any): data is Promise<any> {
  return typeof data === 'object' && typeof data['then'] === 'function';
}
export function getClientStore() {
  return MetaData.clientStore;
}
export function isServer(): boolean {
  return MetaData.isServer;
}
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

export function effect(loadingForGroupName?: string | null, loadingForModuleName?: string) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = MetaData.appModuleName;
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
        if (!MetaData.isServer) {
          if (!loadingForModuleName) {
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
export function delayPromise(second: number) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun = descriptor.value;
    descriptor.value = (...args: any[]) => {
      const delay = new Promise((resolve) => {
        setTimeout(() => {
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
          actionName = actionName.trim().replace(new RegExp(`^this[${config.NSP}]`), `${moduleName}${config.NSP}`);
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
