import { ExportModule, HistoryProxy, LoadView, ModuleGetter, StoreOptions } from '@medux/core/types/export';
import { ComponentType, ReactNode } from 'react';
export declare function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(render: (Provider: ComponentType<{
    children: ReactNode;
}>, AppMainView: ComponentType<any>, ssrInitStoreKey: string) => void, moduleGetter: M, appModuleName: A, historyProxy: HistoryProxy, storeOptions: StoreOptions): Promise<void>;
export declare function renderSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(render: (Provider: ComponentType<{
    children: ReactNode;
}>, AppMainView: ComponentType<any>) => any, moduleGetter: M, appModuleName: A, historyProxy: HistoryProxy, storeOptions?: StoreOptions): Promise<{
    html: any;
    data: any;
    ssrInitStoreKey: string;
}>;
export declare const loadView: LoadView;
export declare const exportModule: ExportModule<ComponentType<any>>;
