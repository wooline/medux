import { Store } from 'redux';
import { CoreRootState, CommonModule, ModuleGetter, ModuleModel } from './basic';
import { CoreModuleHandlers } from './inject';
import { StoreOptions } from './store';
export declare type ReturnModule<T> = T extends Promise<infer R> ? R : T;
export declare type ModuleName<M extends CommonModule> = M['default']['moduleName'];
export declare type ModuleStates<M extends CommonModule> = M['default']['initState'];
export declare type ModuleViews<M extends CommonModule> = M['default']['views'];
export declare type ModuleActions<M extends CommonModule> = M['default']['actions'];
export declare type RootState<G extends ModuleGetter> = {
    [key in keyof G]?: ModuleStates<ReturnModule<ReturnType<G[key]>>>;
};
export declare type RootActions<G extends ModuleGetter> = {
    [key in keyof G]: ModuleActions<ReturnModule<ReturnType<G[key]>>>;
};
export declare function modelHotReplacement(moduleName: string, initState: any, ActionHandles: {
    new (moduleName: string, store: any): CoreModuleHandlers;
}): void;
export declare function viewHotReplacement(moduleName: string, views: {
    [key: string]: any;
}): void;
export declare function exportActions<G extends ModuleGetter>(moduleGetter: G): RootActions<G>;
export declare type LoadView<MG extends ModuleGetter, Options = any, Comp = any> = <M extends Extract<keyof MG, string>, V extends ModuleViews<ReturnModule<ReturnType<MG[M]>>>, N extends Extract<keyof V, string>>(moduleName: M, viewName: N, options?: Options, loading?: Comp, error?: Comp) => V[N];
export declare function renderApp<V>(render: (store: Store<CoreRootState>, appModel: ModuleModel, appView: V, ssrInitStoreKey: string) => (appView: V) => void, moduleGetter: ModuleGetter, appModuleOrName: string | CommonModule, appViewName: string, storeOptions?: StoreOptions, beforeRender?: (store: Store<CoreRootState>) => Store<CoreRootState>): Promise<{
    store: Store;
}>;
export declare function renderSSR<V>(render: (store: Store<CoreRootState>, appModel: ModuleModel, appView: V, ssrInitStoreKey: string) => {
    html: any;
    data: any;
    ssrInitStoreKey: string;
    store: Store;
}, moduleGetter: ModuleGetter, appModuleName: string, appViewName: string, storeOptions?: StoreOptions, beforeRender?: (store: Store<CoreRootState>) => Store<CoreRootState>): Promise<{
    html: any;
    data: any;
    ssrInitStoreKey: string;
    store: Store<any, import("redux").AnyAction>;
}>;
