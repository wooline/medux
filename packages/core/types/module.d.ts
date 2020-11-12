import { Store } from 'redux';
import { CoreRootState, ModuleGetter, ModuleModel } from './basic';
import { CoreModelHandlers, CommonModule } from './inject';
import { StoreOptions } from './store';
declare type MeduxModule<M extends any> = M['default'];
export declare type ReturnModule<T> = T extends () => Promise<infer R> ? MeduxModule<R> : T extends () => infer R ? MeduxModule<R> : never;
export declare type ModuleName<M extends any> = M['moduleName'];
export declare type ModuleStates<M extends any> = M['model']['initState'];
export declare type ModuleViews<M extends any> = M['views'];
export declare type ModuleActions<M extends any> = M['actions'];
export declare type RootState<G extends ModuleGetter> = {
    [key in keyof G]?: ModuleStates<ReturnModule<G[key]>>;
};
export declare function modelHotReplacement(moduleName: string, initState: any, ActionHandles: {
    new (moduleName: string, store: any): CoreModelHandlers<any, any>;
}): void;
export declare function viewHotReplacement(moduleName: string, views: {
    [key: string]: any;
}): void;
export declare function exportActions<G extends {
    [N in keyof G]: N extends ModuleName<ReturnModule<G[N]>> ? G[N] : never;
}>(moduleGetter: G): {
    [key in keyof G]: ModuleActions<ReturnModule<G[key]>>;
};
export declare type LoadView<MG extends ModuleGetter, Options = any, Comp = any> = <M extends Extract<keyof MG, string>, V extends ModuleViews<ReturnModule<MG[M]>>, N extends Extract<keyof V, string>>(moduleName: M, viewName: N, options?: Options, loading?: Comp, error?: Comp) => V[N];
export declare function renderApp<V>(render: (store: Store<CoreRootState>, appModel: ModuleModel, appView: V, ssrInitStoreKey: string) => (appView: V) => void, moduleGetter: ModuleGetter, appModuleOrName: string | CommonModule, appViewName: string, storeOptions?: StoreOptions, beforeRender?: (store: Store<CoreRootState>) => Store<CoreRootState>): Promise<void>;
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
export {};
