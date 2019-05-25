import { LoadingState } from './sprite';
export declare const NSP = "/";
export declare const root: {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
    __REDUX_DEVTOOLS_EXTENSION__OPTIONS?: any;
    onerror: any;
    onunhandledrejection: any;
};
export declare const MetaData: {
    isServer: boolean;
    isDev: boolean;
    actionCreatorMap: ActionCreatorMap;
    clientStore: ModelStore;
    appModuleName: string;
};
export interface ActionCreatorMap {
    [moduleName: string]: ActionCreatorList;
}
export interface ActionCreatorList {
    [actionName: string]: ActionCreator;
}
export declare type ActionCreator = (payload?: any) => Action;
interface Store {
    dispatch(action: Action): void;
}
export interface ModelStore extends Store {
    _meta_: {
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
export {};
//# sourceMappingURL=global.d.ts.map