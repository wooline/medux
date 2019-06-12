import { Action, ActionCreatorList, BaseModelState, ModelStore } from './basic';
import { Middleware, ReducersMapObject, Store, StoreEnhancer } from 'redux';
export interface Model<ModelState extends BaseModelState = BaseModelState> {
    moduleName: string;
    initState: ModelState;
    (store: ModelStore): Promise<void>;
}
export interface Module<M extends Model = Model, VS extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> {
    default: {
        moduleName: string;
        model: M;
        views: VS;
    };
}
export declare type GetModule<M extends Module = Module> = () => M | Promise<M>;
export interface ModuleGetter {
    [moduleName: string]: GetModule;
}
export declare function defineModuleGetter<E extends string, T extends {
    [K in E]: () => any;
}>(getter: T): { [key in E]: T[key]; };
export declare type ReturnModule<T extends () => any> = T extends () => Promise<infer R> ? R : T extends () => infer R ? R : never;
export declare type ReturnViews<T extends () => any> = T extends () => Promise<Module<Model, infer R>> ? R : T extends () => Module<Model, infer R> ? R : never;
declare type ModuleStates<M extends any> = M['default']['model']['initState'];
declare type ModuleViews<M extends any> = {
    [key in keyof M['default']['views']]?: number;
};
export declare type RootState<G extends ModuleGetter = {}> = {
    views: {
        [key in keyof G]?: ModuleViews<ReturnModule<G[key]>>;
    };
} & {
    [key in keyof G]?: ModuleStates<ReturnModule<G[key]>>;
};
export declare function exportFacade<T extends ActionCreatorList>(moduleName: string): {
    moduleName: string;
    actions: T;
};
export declare type ExportModule<Component> = <S extends BaseModelState, V extends {
    [key: string]: Component;
}>(moduleName: string, initState: S, ActionHandles: {
    new (initState: S, presetData?: any): BaseModelHandlers<S, any>;
}, views: V) => Module<Model<S>, V>['default'];
export declare const exportModule: ExportModule<any>;
export declare class BaseModelHandlers<S extends BaseModelState, R extends RootState> {
    protected readonly initState: S;
    protected readonly moduleName: string;
    protected readonly store: ModelStore;
    protected readonly actions: Actions<this>;
    constructor(initState: S, presetData?: any);
    protected readonly state: S;
    protected readonly rootState: R;
    protected readonly currentState: S;
    protected readonly currentRootState: R;
    protected dispatch(action: Action): Action | Promise<void>;
    protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {
        type: string;
        playload?: any;
    };
    protected INIT(payload: S): S;
    protected UPDATE(payload: S): S;
    protected LOADING(payload: {
        [group: string]: string;
    }): S;
    protected updateState(payload: Partial<S>): void;
}
declare type Handler<F> = F extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
export declare type Actions<Ins> = {
    [K in keyof Ins]: Ins[K] extends (...args: any[]) => any ? Handler<Ins[K]> : never;
};
export declare function isPromiseModule(module: Module | Promise<Module>): module is Promise<Module>;
export declare function isPromiseView<T>(moduleView: T | Promise<T>): moduleView is Promise<T>;
export declare function loadModel<M extends Module>(getModule: GetModule<M>): Promise<M['default']['model']>;
export declare function getView<T>(moduleGetter: ModuleGetter, moduleName: string, viewName: string): T | Promise<T>;
export declare type LoadView = <MG extends ModuleGetter, M extends Extract<keyof MG, string>, V extends ReturnViews<MG[M]>, N extends Extract<keyof V, string>>(moduleGetter: MG, moduleName: M, viewName: N) => V[N];
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
}, ssrInitStoreKey: string) => void, moduleGetter: M, appModuleName: A, storeOptions?: StoreOptions): Promise<void>;
export declare function renderSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(render: (store: Store, appModel: Model, appViews: {
    [key: string]: any;
}, ssrInitStoreKey: string) => {
    html: any;
    data: any;
    ssrInitStoreKey: string;
}, moduleGetter: M, appModuleName: A, storeOptions?: StoreOptions): Promise<{
    html: any;
    data: any;
    ssrInitStoreKey: string;
}>;
export {};
