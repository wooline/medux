/*global global:true process:true*/

import {LoadingState} from './sprite';
import {setLoading} from './loading';

export const NSP = '/';

// export const root: {__REDUX_DEVTOOLS_EXTENSION__?: any; __REDUX_DEVTOOLS_EXTENSION__OPTIONS?: any; onerror: any; onunhandledrejection: any} = ((typeof self == 'object' &&
//   self.self === self &&
//   self) ||
//   (typeof global == 'object' && global.global === global && global) ||
//   this) as any;

export const MetaData: {
  isServer: boolean;
  isDev: boolean;
  actionCreatorMap: ActionCreatorMap;
  clientStore: ModelStore;
  appModuleName: string;
} = {
  isServer: typeof global !== 'undefined' && typeof window === 'undefined',
  isDev: process.env.NODE_ENV !== 'production',
  actionCreatorMap: {},
  clientStore: null as any,
  appModuleName: null as any,
};

export const client = MetaData.isServer ? undefined : window || global;
export interface ActionCreatorMap {
  [moduleName: string]: ActionCreatorList;
}
export interface ActionCreatorList {
  [actionName: string]: ActionCreator;
}
export type ActionCreator = (payload?: any) => Action;
interface Store {
  dispatch(action: Action): void;
  getState(): {[key: string]: any};
}
export interface ModelStore extends Store {
  _medux_: {
    reducerMap: ReducerMap;
    effectMap: EffectMap;
    injectedModules: {[namespace: string]: boolean};
    currentViews: CurrentViews;
    prevState: {[key: string]: any};
    currentState: {[key: string]: any};
  };
}
export interface CurrentViews {
  [moduleName: string]: {[viewName: string]: number};
}
export interface ReducerHandler extends ActionHandler {
  (payload?: any): BaseModuleState;
}
export interface EffectHandler extends ActionHandler {
  (payload?: any): Promise<any>;
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
  payload?: any;
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
export interface BaseModuleState {
  isModule?: boolean;
  loading?: {[key: string]: LoadingState};
}
export function getModuleActionCreatorList(namespace: string): ActionCreatorList {
  // if (window["Proxy"]) {
  //   actions = new window["Proxy"](
  //     {},
  //     {
  //       get: (target: {}, key: string) => {
  //         return (data: any) => ({ type: namespace + "/" + key, data });
  //       }
  //     }
  //   );
  // } else {
  //   actions = getModuleActions(namespace) as any;
  // }
  if (MetaData.actionCreatorMap[namespace]) {
    return MetaData.actionCreatorMap[namespace];
  } else {
    const obj = {};
    MetaData.actionCreatorMap[namespace] = obj;
    return obj;
  }
}
export function isPromise(data: any): data is Promise<any> {
  return typeof data['then'] === 'function';
}
export function getClientStore() {
  return MetaData.clientStore;
}
export function isServer(): boolean {
  return MetaData.isServer;
}
export function reducer(target: any, key: string, descriptor: PropertyDescriptor) {
  const fun = descriptor.value as ActionHandler;
  fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return descriptor;
}
export function effect(loadingForGroupName?: string | null, loadingForModuleName?: string) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = MetaData.appModuleName;
  }
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
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
    return descriptor;
  };
}
export function logger(
  before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void,
  after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)
) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const fun: ActionHandler = descriptor.value;
    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }
    fun.__decorators__.push([before, after]);
  };
}
export function delayPromise(second: number) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const fun = descriptor.value;
    descriptor.value = (...args: any[]) => {
      const delay = new Promise(resolve => {
        setTimeout(() => {
          resolve(true);
        }, second * 1000);
      });
      return Promise.all([delay, fun.apply(target, args)]).then(items => {
        return items[1];
      });
    };
  };
}
function bindThis(fun: ActionHandler, thisObj: any) {
  const newFun = fun.bind(thisObj);
  Object.keys(fun).forEach(key => {
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

function addModuleActionCreatorList(namespace: string, actionName: string) {
  const actions = getModuleActionCreatorList(namespace);
  if (!actions[actionName]) {
    actions[actionName] = payload => ({type: namespace + NSP + actionName, payload});
  }
}
export function injectActions(store: ModelStore, namespace: string, handlers: ActionHandlerList) {
  for (const actionName in handlers) {
    if (typeof handlers[actionName] === 'function') {
      let handler = handlers[actionName];
      if (handler.__isReducer__ || handler.__isEffect__) {
        handler = bindThis(handler, handlers);
        const arr = actionName.split(NSP);
        if (arr[1]) {
          handler.__isHandler__ = true;
          transformAction(actionName, handler, namespace, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
        } else {
          handler.__isHandler__ = false;
          transformAction(namespace + NSP + actionName, handler, namespace, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
          addModuleActionCreatorList(namespace, actionName);
        }
      }
    }
  }
  return getModuleActionCreatorList(namespace);
}