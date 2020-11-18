import { Unsubscribe } from 'redux';
import { LoadingState } from './sprite';
export declare const config: {
    NSP: string;
    VSP: string;
    MSP: string;
};
export declare function setConfig(_config: {
    NSP?: string;
    VSP?: string;
    MSP?: string;
    RSP?: string;
}): void;
export interface CommonModule<S extends CoreModuleState = CoreModuleState> {
    default: {
        moduleName: string;
        initState: S;
        model: (store: ModelStore) => void | Promise<void>;
        views: {
            [key: string]: any;
        };
        actions: {
            [actionName: string]: (...args: any[]) => Action;
        };
    };
}
export declare const ActionTypes: {
    MLoading: string;
    MInit: string;
    Error: string;
};
export declare type ModuleGetter = {
    [moduleName: string]: () => CommonModule | Promise<CommonModule>;
};
export declare const MetaData: {
    actionCreatorMap: ActionCreatorMap;
    clientStore: ModelStore;
    appModuleName: string;
    appViewName: string;
    moduleGetter: ModuleGetter;
};
export declare function setLoadingDepthTime(second: number): void;
export declare function setLoading<T extends Promise<any>>(item: T, moduleName?: string, groupName?: string): T;
export interface Action {
    type: string;
    priority?: string[];
    payload?: any[];
}
export interface Store {
    dispatch(action: Action): Action | Promise<void>;
    getState(): {
        [key: string]: any;
    };
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
export interface ModelStore extends Store {
    _medux_: {
        reducerMap: ReducerMap;
        effectMap: EffectMap;
        injectedModules: {
            [moduleName: string]: Record<string, any>;
        };
        beforeState: CoreRootState;
        prevState: CoreRootState;
        currentState: CoreRootState;
    };
}
export interface CoreModuleState {
    initialized?: boolean;
    loading?: {
        [key: string]: LoadingState;
    };
}
export declare type CoreRootState = {
    [moduleName: string]: CoreModuleState;
};
export declare type ModuleModel = (store: ModelStore) => void | Promise<void>;
export interface ActionCreatorMap {
    [moduleName: string]: ActionCreatorList;
}
export interface ActionCreatorList {
    [actionName: string]: ActionCreator;
}
export declare type ActionCreator = (...args: any[]) => Action;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
export declare function effect(loadingForGroupName?: string | null, loadingForModuleName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => any;
export declare function logger(before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function delayPromise(second: number): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function isPromise(data: any): data is Promise<any>;
export declare function isServer(): boolean;
