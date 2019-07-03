import { LoadingState } from './sprite';
import { ModuleGetter } from './module';
export declare const NSP = "/";
export declare const MetaData: {
    isServer: boolean;
    isDev: boolean;
    actionCreatorMap: ActionCreatorMap;
    clientStore: ModelStore;
    appModuleName: string;
    moduleGetter: ModuleGetter;
};
export declare const client: Window | undefined;
export interface ActionCreatorMap {
    [moduleName: string]: ActionCreatorList;
}
export interface ActionCreatorList {
    [actionName: string]: ActionCreator;
}
export declare type ActionCreator = (payload?: any) => Action;
interface Store {
    dispatch(action: Action): Action | Promise<void>;
    getState(): {
        [key: string]: any;
    };
}
export interface ModelStore extends Store {
    _medux_: {
        reducerMap: ReducerMap;
        effectMap: EffectMap;
        injectedModules: {
            [moduleName: string]: boolean;
        };
        currentViews: CurrentViews;
        prevState: {
            [key: string]: any;
        };
        currentState: {
            [key: string]: any;
        };
    };
}
export interface DisplayViews {
    [moduleName: string]: {
        [viewName: string]: boolean;
    };
}
export interface CurrentViews {
    [moduleName: string]: {
        [viewName: string]: {
            [key: string]: boolean;
        };
    };
}
export interface ReducerHandler extends ActionHandler {
    (payload?: any): BaseModelState;
}
export interface EffectHandler extends ActionHandler {
    (payload?: any): Promise<any>;
}
export interface ActionHandlerList {
    [actionName: string]: ActionHandler;
}
export interface ActionHandlerMap {
    [actionName: string]: {
        [moduleName: string]: ActionHandler;
    };
}
export interface ReducerMap extends ActionHandlerMap {
    [actionName: string]: {
        [moduleName: string]: ReducerHandler;
    };
}
export interface EffectMap extends ActionHandlerMap {
    [actionName: string]: {
        [moduleName: string]: EffectHandler;
    };
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
export interface BaseModelState {
    isModule?: boolean;
    loading?: {
        [key: string]: LoadingState;
    };
}
export declare function isPromise(data: any): data is Promise<any>;
export declare function getStore(): ModelStore;
export declare function isServer(): boolean;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
export declare function effect(loadingForGroupName?: string | null, loadingForModuleName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => any;
export declare function logger(before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function delayPromise(second: number): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function injectActions(store: ModelStore, moduleName: string, handlers: ActionHandlerList): ActionCreatorList;
export {};
