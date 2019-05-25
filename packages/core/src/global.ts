/*global global:true process:true*/

import {LoadingState} from './sprite';

export const NSP = '/';

export const root: {__REDUX_DEVTOOLS_EXTENSION__?: any; __REDUX_DEVTOOLS_EXTENSION__OPTIONS?: any; onerror: any; onunhandledrejection: any} = ((typeof self == 'object' &&
  self.self === self &&
  self) ||
  (typeof global == 'object' && global.global === global && global) ||
  this) as any;

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
export interface ActionCreatorMap {
  [moduleName: string]: ActionCreatorList;
}
export interface ActionCreatorList {
  [actionName: string]: ActionCreator;
}
export type ActionCreator = (payload?: any) => Action;
interface Store {
  dispatch(action: Action): void;
}
export interface ModelStore extends Store {
  _meta_: {
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
