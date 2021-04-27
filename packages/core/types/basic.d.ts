import { LoadingState } from './sprite';
export declare const config: {
    NSP: string;
    MSP: string;
    MutableData: boolean;
    DepthTimeOnLoading: number;
};
export declare function setConfig(_config: {
    NSP?: string;
    MSP?: string;
    SSRKey?: string;
    MutableData?: boolean;
    DepthTimeOnLoading?: number;
}): void;
export interface Action {
    type: string;
    priority?: string[];
    payload?: any[];
}
export interface ActionHandler {
    __isReducer__?: boolean;
    __isEffect__?: boolean;
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
export declare type ActionCreator = (...args: any[]) => Action;
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
export declare type Dispatch = (action: Action) => void | Promise<void>;
export declare type State = {
    [moduleName: string]: {
        [key: string]: any;
    };
};
export interface GetState<S extends State = {}> {
    (): S;
    (moduleName: string): {
        [key: string]: any;
    } | undefined;
}
export interface StoreProxy<S extends State = {}> {
    update(actionName: string, state: Partial<S>, actionData: any[]): void;
    getState: GetState<S>;
}
export interface IController<S extends State = {}> {
    setStore(store: StoreProxy<S>): void;
    dispatch: Dispatch;
    getState: GetState<S>;
    injectedModules: {
        [moduleName: string]: IModuleHandlers;
    };
    prevData: {
        actionName: string;
        prevState: S;
    };
}
export interface CoreModuleState {
    loading?: {
        [key: string]: LoadingState;
    };
}
export declare type Model = (controller: IController) => void | Promise<void>;
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
export declare type ModuleGetter = {
    [moduleName: string]: () => CommonModule | Promise<CommonModule>;
};
export interface FacadeMap {
    [moduleName: string]: {
        name: string;
        actions: ActionCreatorList;
        actionNames: {
            [key: string]: string;
        };
    };
}
export declare const ActionTypes: {
    MLoading: string;
    MInit: string;
    MReInit: string;
    Error: string;
};
export declare const MetaData: {
    facadeMap: FacadeMap;
    clientController: IController;
    appModuleName: string;
    appViewName: string;
    moduleGetter: ModuleGetter;
    injectedModules: {
        [moduleName: string]: boolean;
    };
    reducersMap: ActionHandlerMap;
    effectsMap: ActionHandlerMap;
};
export declare function injectActions(moduleName: string, handlers: ActionHandlerList): void;
export declare function setLoading<T extends Promise<any>>(item: T, moduleName?: string, groupName?: string): T;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
export declare function effect(loadingForGroupName?: string | null, loadingForModuleName?: string): (target: any, key: string, descriptor: PropertyDescriptor) => any;
export declare function logger(before: (action: Action, moduleName: string, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function deepMergeState(target?: any, ...args: any[]): any;
export declare function mergeState(target?: any, ...args: any[]): any;
