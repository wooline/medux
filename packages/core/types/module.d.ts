import { CommonModule, ModuleGetter, ModuleStore, ModuleModel } from './basic';
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
export declare type RootModuleAPI<A extends RootModuleFacade = RootModuleFacade> = {
    [key in keyof A]: Pick<A[key], 'name' | 'actions' | 'actionNames'>;
};
export declare type RootModuleState<A extends RootModuleFacade = RootModuleFacade> = {
    [key in keyof A]: A[key]['state'];
};
export declare type LoadView<A extends RootModuleFacade = {}, Options = any, Comp = any> = <M extends keyof A, V extends A[M]['viewName']>(moduleName: M, viewName: V, options?: Options, loading?: Comp, error?: Comp) => A[M]['views'][V];
export declare function getRootModuleAPI(data?: {
    [moduleName: string]: {
        actionNames: {
            [key: string]: string;
        };
    };
}): RootModuleAPI<any>;
export declare function modelHotReplacement(moduleName: string, ActionHandles: {
    new (): CoreModuleHandlers;
}): void;
export declare function viewHotReplacement(moduleName: string, views: {
    [key: string]: any;
}): void;
export declare function renderApp<V>(render: (store: ModuleStore, appModel: ModuleModel, appView: V, ssrInitStoreKey: string) => (appView: V) => void, moduleGetter: ModuleGetter, appModuleOrName: string | CommonModule, appViewName: string, storeOptions: StoreOptions | undefined, beforeRender: (store: ModuleStore) => void): Promise<{
    store: ModuleStore;
}>;
export declare function renderSSR<V>(render: (store: ModuleStore, appModel: ModuleModel, appView: V, ssrInitStoreKey: string) => {
    html: any;
    data: any;
    ssrInitStoreKey: string;
    store: ModuleStore;
}, moduleGetter: ModuleGetter, appModuleName: string, appViewName: string, storeOptions: StoreOptions | undefined, beforeRender: (store: ModuleStore) => string[]): Promise<{
    html: any;
    data: any;
    ssrInitStoreKey: string;
    store: ModuleStore;
}>;
export {};
