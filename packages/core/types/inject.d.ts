import { Action, IModuleHandlers, CoreModuleState, CommonModule, Model, ModuleGetter, IStore } from './basic';
declare type Handler<F> = F extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
declare type Actions<Ins> = {
    [K in keyof Ins]: Ins[K] extends (...args: any) => any ? Handler<Ins[K]> : never;
};
export interface Module<N extends string = string, H extends IModuleHandlers = IModuleHandlers, VS extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> {
    default: {
        moduleName: N;
        model: Model;
        initState: H['initState'];
        views: VS;
        actions: Actions<H>;
    };
}
export declare type ExportModule<Component> = <N extends string, V extends {
    [key: string]: Component;
}, H extends IModuleHandlers>(moduleName: N, ModuleHandles: {
    new (): H;
}, views: V) => Module<N, H, V>['default'];
export declare const exportModule: ExportModule<any>;
export declare function cacheModule<T extends CommonModule>(module: T): () => T;
export declare function getModuleByName(moduleName: string): Promise<CommonModule> | CommonModule;
export declare function getView<T>(moduleName: string, viewName: string): T | Promise<T>;
export declare function loadModel<MG extends ModuleGetter>(moduleName: Extract<keyof MG, string>, controller: IStore): void | Promise<void>;
export declare abstract class CoreModuleHandlers<S extends CoreModuleState = CoreModuleState, R extends Record<string, any> = {}> implements IModuleHandlers {
    readonly initState: S;
    actions: Actions<this>;
    store: IStore<R>;
    moduleName: string;
    constructor(initState: S);
    protected get state(): S;
    protected get rootState(): R;
    protected getCurrentActionName(): string;
    protected get currentRootState(): R;
    protected get currentState(): S;
    protected dispatch(action: Action): void | Promise<void>;
    protected loadModel(moduleName: string): void | Promise<void>;
    Init(initState: S): S;
    Update(payload: Partial<S>, key: string): S;
    Loading(payload: {
        [group: string]: string;
    }): S;
}
export declare function modelHotReplacement(moduleName: string, ModuleHandles: {
    new (): IModuleHandlers;
}): void;
export declare type ReturnModule<T> = T extends Promise<infer R> ? R : T;
declare type ModuleFacade<M extends CommonModule> = {
    name: string;
    views: M['default']['views'];
    viewName: Extract<keyof M['default']['views'], string>;
    state: M['default']['initState'];
    actions: M['default']['actions'];
    actionNames: {
        [key in keyof M['default']['actions']]: string;
    };
};
export declare type RootModuleFacade<G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<CommonModule<N>>;
} = any> = {
    [K in Extract<keyof G, string>]: ModuleFacade<ReturnModule<ReturnType<G[K]>>>;
};
export declare type RootModuleActions<A extends RootModuleFacade> = {
    [K in keyof A]: keyof A[K]['actions'];
};
export declare type RootModuleAPI<A extends RootModuleFacade = RootModuleFacade> = {
    [key in keyof A]: Pick<A[key], 'name' | 'actions' | 'actionNames'>;
};
export declare type RootModuleState<A extends RootModuleFacade = RootModuleFacade> = {
    [key in keyof A]: A[key]['state'];
};
export declare function getRootModuleAPI<T extends RootModuleFacade = any>(data?: {
    [moduleName: string]: string[];
}): RootModuleAPI<T>;
export declare type BaseLoadView<A extends RootModuleFacade = {}, Options extends {
    OnLoading?: any;
    OnError?: any;
} = {
    OnLoading?: any;
    OnError?: any;
}> = <M extends keyof A, V extends A[M]['viewName']>(moduleName: M, viewName: V, options?: Options) => A[M]['views'][V];
export {};
