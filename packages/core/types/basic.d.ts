import { LoadingState } from './sprite';
export declare const NSP = "/";
export declare const MetaData: {
    isServer: boolean;
    isDev: boolean;
    actionCreatorMap: ActionCreatorMap;
    clientStore: ModelStore;
    appModuleName: string;
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
    dispatch(action: Action): void;
    getState(): {
        [key: string]: any;
    };
}
export interface ModelStore extends Store {
    _medux_: {
        reducerMap: ReducerMap;
        effectMap: EffectMap;
        injectedModules: {
            [namespace: string]: boolean;
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
export interface CurrentViews {
    [moduleName: string]: {
        [viewName: string]: number;
    };
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
export interface BaseModuleState {
    isModule?: boolean;
    loading?: {
        [key: string]: LoadingState;
    };
}
export declare function getModuleActionCreatorList(namespace: string): ActionCreatorList;
export declare function isPromise(data: any): data is Promise<any>;
export declare function getClientStore(): ModelStore;
export declare function isServer(): boolean;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor;
export declare function effect(loadingForGroupName?: string | null, loadingForModuleName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function logger(before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function delayPromise(second: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function injectActions(store: ModelStore, namespace: string, handlers: ActionHandlerList): ActionCreatorList;
export {};
