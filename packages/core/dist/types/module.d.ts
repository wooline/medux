import { Middleware, ReducersMapObject, StoreEnhancer, Store } from 'redux';
import { Action, ActionCreatorList, ModelStore, BaseModuleState } from './basic';
export interface Model<ModuleState = BaseModuleState> {
    namespace: string;
    initState: ModuleState;
    (store: ModelStore): Promise<void>;
}
export interface Module<M extends Model = Model, VS extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> {
    model: M;
    views: VS;
}
export declare type GetModule<M extends Module = Module> = () => M | Promise<M>;
export interface ModuleGetter {
    [moduleName: string]: GetModule;
}
export declare type ReturnModule<T extends () => any> = T extends () => Promise<infer R> ? R : T extends () => infer R ? R : Module;
export declare type ReturnViews<T extends () => any> = T extends () => Promise<Module<Model, infer R>> ? R : never;
declare type ModuleStates<M extends any> = M['model']['initState'];
declare type ModuleViews<M extends any> = {
    [key in keyof M['views']]?: number;
};
export declare type RootState<G extends ModuleGetter = {}> = {
    views: {
        [key in keyof G]?: ModuleViews<ReturnModule<G[key]>>;
    };
} & {
    [key in keyof G]?: ModuleStates<ReturnModule<G[key]>>;
};
export declare function exportModule<T extends ActionCreatorList>(namespace: string): {
    namespace: string;
    actions: T;
};
export declare class BaseModuleHandlers<S extends BaseModuleState, R extends RootState<{}>, N extends string> {
    protected readonly initState: S;
    protected readonly namespace: N;
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
export declare function exportModel<S extends BaseModuleState, N extends string>(namespace: N, HandlersClass: {
    new (initState: S, presetData?: any): BaseModuleHandlers<BaseModuleState, RootState<{}>, N>;
}, initState: S): Model<S>;
export declare function loadModel<M extends Module>(getModule: GetModule<M>): Promise<M['model']>;
export declare function getView<M extends Module, N extends Extract<keyof M['views'], string>>(getModule: GetModule<M>, viewName: N): M['views'][N] | Promise<M['views'][N]>;
export interface ExportView<C> {
    (ComponentView: C, model: Model, viewName: string): C;
}
export interface LoadView<MG extends ModuleGetter, M extends Extract<keyof MG, string>, V extends ReturnViews<MG[M]>, N extends Extract<keyof V, string>> {
    (moduleGetter: MG, moduleName: M, viewName: N): V[N];
}
export interface StoreOptions {
    ssrInitStoreKey?: string;
    reducers?: ReducersMapObject;
    middlewares?: Middleware[];
    enhancers?: StoreEnhancer[];
    initData?: {
        [key: string]: any;
    };
}
export declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(render: (store: Store, appModel: Model, appViews: {
    [key: string]: any;
}) => void, moduleGetter: M, appName: A, storeOptions?: StoreOptions): Promise<void>;
export declare function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(render: (store: Store, appModel: Model, appViews: {
    [key: string]: any;
}, ssrInitStoreKey: string) => void, moduleGetter: M, appName: A, storeOptions?: StoreOptions): Promise<void>;
export {};
//# sourceMappingURL=module.d.ts.map