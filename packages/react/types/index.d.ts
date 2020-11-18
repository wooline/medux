/// <reference path="../env/global.d.ts" />
import * as core from '@medux/core';
import { ExportModule, ModuleGetter, StoreOptions, ModuleStore } from '@medux/core';
import { ComponentType, ReactElement } from 'react';
export declare function renderApp(moduleGetter: ModuleGetter, appModuleName: string, appViewName: string, storeOptions: StoreOptions, container?: string | Element | ((component: ReactElement<any>) => void), beforeRender?: (store: ModuleStore) => ModuleStore): Promise<{
    store: core.ModuleStore;
}>;
export declare function renderSSR(moduleGetter: ModuleGetter, appModuleName: string, appViewName: string, storeOptions?: StoreOptions, renderToStream?: boolean, beforeRender?: (store: ModuleStore) => ModuleStore): Promise<{
    html: any;
    data: any;
    ssrInitStoreKey: string;
    store: core.ModuleStore;
}>;
export declare type LoadView<T extends ModuleGetter> = core.LoadView<T, {
    forwardRef?: boolean;
}, ComponentType<any>>;
export declare const loadView: LoadView<any>;
export declare const exportModule: ExportModule<ComponentType<any>>;
