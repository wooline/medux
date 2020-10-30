import { Unsubscribe } from 'redux';
import { LoadingState } from './sprite';
import { ModuleGetter } from './module';
export declare function isServer(): boolean;
export declare function setLoadingDepthTime(second: number): void;
export declare const config: {
    NSP: string;
    VSP: string;
    MSP: string;
    RSP: string;
};
export declare function setConfig(_config: {
    NSP?: string;
    VSP?: string;
    MSP?: string;
    RSP?: string;
}): void;
export declare const MetaData: {
    actionCreatorMap: ActionCreatorMap;
    clientStore: ModelStore;
    appModuleName: string;
    appViewName: string;
    moduleGetter: ModuleGetter;
};
export declare const ActionTypes: {
    MLoading: string;
    MInit: string;
    MRouteParams: string;
    Error: string;
    RouteChange: string;
};
export declare function setLoading<T extends Promise<any>>(item: T, moduleName?: string, groupName?: string): T;
export interface ActionCreatorMap {
    [moduleName: string]: ActionCreatorList;
}
export interface ActionCreatorList {
    [actionName: string]: ActionCreator;
}
export declare type ActionCreator = (...args: any[]) => Action;
interface Store {
    dispatch(action: Action): Action | Promise<void>;
    getState(): {
        [key: string]: any;
    };
    subscribe(listener: () => void): Unsubscribe;
}
export interface ModelStore extends Store {
    _medux_: {
        reducerMap: ReducerMap;
        effectMap: EffectMap;
        injectedModules: {
            [moduleName: string]: Record<string, any>;
        };
        beforeState: StoreState;
        prevState: StoreState;
        currentState: StoreState;
        destroy: () => void;
    };
}
export declare type RouteParams = {
    [moduleName: string]: {
        [key: string]: any;
    } | undefined;
};
export declare type HistoryAction = 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
export interface RouteData<P extends RouteParams = any> {
    views: DisplayViews;
    params: P;
    paths: string[];
    action: HistoryAction;
    key: string;
}
export interface Location {
    url: string;
    pathname: string;
    action: HistoryAction;
    key: string;
}
export interface RouteState<L extends Location = Location, P extends RouteParams = RouteParams> {
    history: string[];
    stack: string[];
    location: L;
    data: RouteData<P>;
}
export declare type StoreState = {
    [moduleName: string]: BaseModelState;
} & {
    route: RouteState;
};
export interface DisplayViews {
    [moduleName: string]: {
        [viewName: string]: boolean | undefined;
    } | undefined;
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
        views: {
            [key: string]: any;
        };
        actions: {
            [actionName: string]: (...args: any[]) => Action;
        };
    };
}
export declare function cacheModule<T extends CommonModule>(module: T): () => T;
export interface BaseModelState<R = {
    [key: string]: any;
}> {
    isModule?: boolean;
    isHydrate?: boolean;
    routeParams?: R;
    loading?: {
        [key: string]: LoadingState;
    };
}
export declare function isPromise(data: any): data is Promise<any>;
export declare function getClientStore(): ModelStore;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
export declare function effect(loadingForGroupName?: string | null, loadingForModuleName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => any;
export declare function logger(before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function delayPromise(second: number): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function isProcessedError(error: any): boolean | undefined;
export declare function setProcessedError(error: any, meduxProcessed: boolean): {
    meduxProcessed: boolean;
    [key: string]: any;
};
export declare function injectActions(store: ModelStore, moduleName: string, handlers: ActionHandlerList): ActionCreatorList;
export {};
