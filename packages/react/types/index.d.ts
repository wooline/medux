import { LoadView as BaseLoadView, ExportModule, HistoryProxy, ModuleGetter, StoreOptions } from '@medux/core/types/export';
import { ComponentType, ReactNode } from 'react';
export declare function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(render: (Provider: ComponentType<{
    children: ReactNode;
}>, AppMainView: any, ssrInitStoreKey: string) => void, moduleGetter: M, appModuleName: A, historyProxy: HistoryProxy, storeOptions: StoreOptions): Promise<import("redux").Store<any, import("redux").AnyAction>>;
export declare function renderSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(render: (Provider: ComponentType<{
    children: ReactNode;
}>, AppMainView: ComponentType<any>) => any, moduleGetter: M, appModuleName: A, historyProxy: HistoryProxy, storeOptions?: StoreOptions): Promise<{
    html: any;
    data: any;
    ssrInitStoreKey: string;
    store: import("redux").Store<any, import("redux").AnyAction>;
}>;
export declare type LoadView<T extends ModuleGetter> = BaseLoadView<T, {
    forwardRef?: boolean;
}, ComponentType<any>>;
export declare const loadView: LoadView<any>;
export declare const exportModule: ExportModule<ComponentType<any>>;
