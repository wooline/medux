import { CommonModule, ModuleGetter, ModuleStore } from './basic';
import { CoreModuleHandlers } from './inject';
import { StoreOptions } from './store';
export declare type ReturnModule<T> = T extends Promise<infer R> ? R : T;
declare type ModuleFacade<M extends CommonModule> = {
    name: string;
    views: M['default']['views'];
    viewName: keyof M['default']['views'];
    state: M['default']['initState'];
    actions: M['default']['actions'];
    actionNames: {
        [key in keyof M['default']['actions']]: string;
    };
};
export declare type RootModuleFacade<G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<CommonModule<N>>;
} = ModuleGetter> = {
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
export declare type BaseLoadView<A extends RootModuleFacade = {}, Options extends {
    OnLoading?: any;
    OnError?: any;
} = {
    OnLoading?: any;
    OnError?: any;
}> = <M extends keyof A, V extends A[M]['viewName']>(moduleName: M, viewName: V, options?: Options) => A[M]['views'][V];
export declare function getRootModuleAPI<T extends RootModuleFacade = any>(data?: {
    [moduleName: string]: string[];
}): RootModuleAPI<T>;
export declare function modelHotReplacement(moduleName: string, ActionHandles: {
    new (): CoreModuleHandlers;
}): void;
export declare function viewHotReplacement(moduleName: string, views: {
    [key: string]: any;
}): void;
export declare function renderApp<V>(render: (store: ModuleStore, appView: V) => (appView: V) => void, moduleGetter: ModuleGetter, appModuleOrName: string | CommonModule, appViewName: string, storeOptions: StoreOptions | undefined, startup: (store: ModuleStore) => void, preModules: string[]): Promise<ModuleStore>;
export declare function renderSSR<V>(render: (store: ModuleStore, appView: V) => {
    html: any;
    data: any;
    store: ModuleStore;
}, moduleGetter: ModuleGetter, appModuleOrName: string | CommonModule, appViewName: string, storeOptions: StoreOptions | undefined, startup: (store: ModuleStore) => void, preModules: string[]): Promise<{
    html: any;
    data: any;
    store: ModuleStore;
}>;
export {};
