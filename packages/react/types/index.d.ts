import * as core from '@medux/core';
import { ExportModule, HistoryProxy, ModuleGetter, StoreOptions } from '@medux/core';
import { ComponentType, ReactElement } from 'react';
export declare function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, historyProxy: HistoryProxy, storeOptions: StoreOptions, container?: string | Element | ((component: ReactElement<any>) => void)): Promise<import("redux").Store<any, import("redux").AnyAction>>;
export declare function renderSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, historyProxy: HistoryProxy, storeOptions?: StoreOptions, renderToStream?: boolean): Promise<{
    html: any;
    data: any;
    ssrInitStoreKey: string;
    store: import("redux").Store<any, import("redux").AnyAction>;
}>;
export declare type LoadView<T extends ModuleGetter> = core.LoadView<T, {
    forwardRef?: boolean;
}, ComponentType<any>>;
export declare const loadView: LoadView<any>;
export declare const exportModule: ExportModule<ComponentType<any>>;
