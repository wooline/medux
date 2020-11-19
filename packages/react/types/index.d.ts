/// <reference path="../env/global.d.ts" />
import * as core from '@medux/core';
import { ExportModule, ModuleGetter, StoreOptions, ModuleStore } from '@medux/core';
import React, { ComponentType } from 'react';
export declare function renderApp(moduleGetter: ModuleGetter, appModuleName: string, appViewName: string, storeOptions: StoreOptions, container: string | Element | ((component: React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) => void) | undefined, beforeRender: (store: ModuleStore) => void): Promise<{
    store: core.ModuleStore;
}>;
export declare function renderSSR(moduleGetter: ModuleGetter, appModuleName: string, appViewName: string, storeOptions: core.StoreOptions | undefined, renderToStream: boolean | undefined, beforeRender: (store: ModuleStore) => string[]): Promise<{
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
