import { ActionCreatorMap, CommonModule, ModuleGetter, ModuleStore, ModuleModel, ViewNamesMap } from './basic';
import { CoreModuleHandlers } from './inject';
import { StoreOptions } from './store';
export declare type ReturnModule<T> = T extends Promise<infer R> ? R : T;
declare type ModuleExports<M extends CommonModule> = {
    name: string;
    views: M['default']['views'];
    viewName: keyof M['default']['views'];
    viewNames: {
        [key in keyof M['default']['views']]: string;
    };
    viewMounted: {
        [key in keyof M['default']['views']]?: boolean;
    };
    state: M['default']['initState'];
    actions: M['default']['actions'];
    actionNames: {
        [key in keyof M['default']['actions']]: string;
    };
};
export declare type RootModuleExports<G extends ModuleGetter = ModuleGetter> = {
    [key in keyof G]: ModuleExports<ReturnModule<ReturnType<G[key]>>>;
};
export declare type RootFacade<G extends RootModuleExports = RootModuleExports> = {
    [key in keyof G]: Pick<G[key], 'name' | 'actions' | 'actionNames' | 'viewNames'>;
};
export declare type LoadView<MS extends RootModuleExports, Options = any, Comp = any> = <M extends keyof MS, V extends MS[M]['viewName']>(moduleName: M, viewName: V, options?: Options, loading?: Comp, error?: Comp) => MS[M]['views'][V];
export declare function modelHotReplacement(moduleName: string, ActionHandles: {
    new (): CoreModuleHandlers;
}): void;
export declare function viewHotReplacement(moduleName: string, views: {
    [key: string]: any;
}): void;
export declare function exportModuleStaticInfo(actionCreatorMap?: ActionCreatorMap, viewNamesMap?: ViewNamesMap): {
    actions: ActionCreatorMap;
    views: ViewNamesMap;
};
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
