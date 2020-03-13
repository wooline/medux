import { Action, ActionCreatorList, BaseModelState, ModelStore, RouteState } from './basic';
import { HistoryProxy } from './store';
import { Middleware, ReducersMapObject, Store, StoreEnhancer } from 'redux';
export interface Model<ModelState extends BaseModelState = BaseModelState> {
    moduleName: string;
    initState: ModelState;
    (store: ModelStore, options?: any): void | Promise<void>;
}
export interface Module<M extends Model = Model, VS extends {
    [key: string]: any;
} = {
    [key: string]: any;
}, AS extends ActionCreatorList = {}, N extends string = string> {
    default: {
        moduleName: N;
        model: M;
        views: VS;
        actions: AS;
    };
}
export interface ModuleGetter {
    [moduleName: string]: () => Module | Promise<Module>;
}
declare type ReturnModule<T> = T extends () => Promise<infer R> ? R : T extends () => infer R ? R : never;
declare type ModuleName<M extends any> = M['default']['moduleName'];
declare type ModuleStates<M extends any> = M['default']['model']['initState'];
declare type ModuleParams<M extends any> = M['default']['model']['initState']['routeParams'];
declare type ModuleViews<M extends any> = M['default']['views'];
declare type ModuleActions<M extends any> = M['default']['actions'];
declare type MountViews<M extends any> = {
    [key in keyof M['default']['views']]?: boolean;
};
export declare type RootState<G extends ModuleGetter, L> = {
    route: {
        location: L;
        data: {
            views: {
                [key in keyof G]?: MountViews<ReturnModule<G[key]>>;
            };
            params: {
                [key in keyof G]?: ModuleParams<ReturnModule<G[key]>>;
            };
            stackParams: {
                [moduleName: string]: {
                    [key: string]: any;
                } | undefined;
            }[];
            paths: any;
        };
    };
} & {
    [key in keyof G]?: ModuleStates<ReturnModule<G[key]>>;
};
export declare type ExportModule<Component> = <S extends BaseModelState, V extends {
    [key: string]: Component;
}, T extends BaseModelHandlers<S, any>, N extends string>(moduleName: N, initState: S, ActionHandles: {
    new (moduleName: string, store: any): T;
}, views: V) => Module<Model<S>, V, Actions<T>, N>['default'];
export declare const exportModule: ExportModule<any>;
export declare abstract class BaseModelHandlers<S extends BaseModelState, R extends {
    route: RouteState;
}> {
    protected readonly moduleName: string;
    protected readonly store: ModelStore;
    protected readonly actions: Actions<this>;
    constructor(moduleName: string, store: ModelStore);
    protected get state(): S;
    protected getState(): S;
    protected get rootState(): R;
    protected getRootState(): R;
    protected get currentState(): S;
    protected getCurrentState(): S;
    protected get currentRootState(): R;
    protected getCurrentRootState(): R;
    protected get beforeState(): undefined | S;
    protected getBeforeState(): undefined | S;
    protected get beforeRootState(): R;
    protected getBeforeRootState(): R;
    protected dispatch(action: Action): Action | Promise<void>;
    protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {
        type: string;
        payload?: any[];
    };
    protected updateState(payload: Partial<S>): void;
    protected loadModel(moduleName: Extract<keyof R, string>, options?: any): void | Promise<void>;
    protected Init(initState: S, routeParams?: any, options?: any): S;
    protected Update(payload: S): S;
    RouteParams(payload: {
        [key: string]: any;
    }): S;
    protected Loading(payload: {
        [group: string]: string;
    }): S;
}
declare type Handler<F> = F extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
export declare type Actions<Ins> = {
    [K in keyof Ins]: Ins[K] extends (...args: any[]) => any ? Handler<Ins[K]> : never;
};
export declare function isPromiseModule(module: Module | Promise<Module>): module is Promise<Module>;
export declare function isPromiseView<T>(moduleView: T | Promise<T>): moduleView is Promise<T>;
export declare function exportActions<G extends {
    [N in keyof G]: N extends ModuleName<ReturnModule<G[N]>> ? G[N] : never;
}>(moduleGetter: G): {
    [key in keyof G]: ModuleActions<ReturnModule<G[key]>>;
};
export declare function getView<T>(moduleName: string, viewName: string, modelOptions?: any): T | Promise<T>;
export declare type LoadView<MG extends ModuleGetter, Ags = any> = <M extends Extract<keyof MG, string>, V extends ModuleViews<ReturnModule<MG[M]>>, N extends Extract<keyof V, string>>(moduleName: M, viewName: N, modelOptions?: any, args?: Ags) => V[N];
export interface StoreOptions {
    ssrInitStoreKey?: string;
    reducers?: ReducersMapObject;
    middlewares?: Middleware[];
    enhancers?: StoreEnhancer[];
    initData?: {
        [key: string]: any;
    };
}
export declare function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(render: (store: Store, appModel: Model, appViews: {
    [key: string]: any;
}, ssrInitStoreKey: string) => void, moduleGetter: M, appModuleName: A, history: HistoryProxy, storeOptions?: StoreOptions): Promise<Store>;
export declare function renderSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(render: (store: Store, appModel: Model, appViews: {
    [key: string]: any;
}, ssrInitStoreKey: string) => {
    html: any;
    data: any;
    ssrInitStoreKey: string;
    store: Store;
}, moduleGetter: M, appModuleName: A, history: HistoryProxy, storeOptions?: StoreOptions): Promise<{
    html: any;
    data: any;
    ssrInitStoreKey: string;
    store: Store<any, import("redux").AnyAction>;
}>;
export {};
