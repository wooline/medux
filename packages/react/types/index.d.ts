import * as core from '@medux/core';
import { ExportModule, HistoryProxy, ModuleGetter, StoreOptions, StoreState } from '@medux/core';
import { ComponentType, ReactElement } from 'react';
import { Store } from 'redux';
export declare function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, historyProxy: HistoryProxy, storeOptions: StoreOptions, container?: string | Element | ((component: ReactElement<any>) => void), beforeRender?: (store: Store<StoreState>) => Store<StoreState>): Promise<void>;
export declare function renderSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, historyProxy: HistoryProxy, storeOptions?: StoreOptions, renderToStream?: boolean, beforeRender?: (store: Store<StoreState>) => Store<StoreState>): Promise<{
    html: any;
    data: any;
    ssrInitStoreKey: string;
    store: Store<any, import("redux").AnyAction>;
}>;
export declare type LoadView<T extends ModuleGetter> = core.LoadView<T, {
    forwardRef?: boolean;
}, ComponentType<any>>;
export declare const loadView: LoadView<any>;
export declare const exportModule: ExportModule<ComponentType<any>>;
