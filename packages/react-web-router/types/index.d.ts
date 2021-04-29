import './env';
import type { ComponentType } from 'react';
import type { ModuleGetter, ExportModule, ControllerMiddleware, StoreBuilder, BStoreOptions, BStore, RootModuleFacade, RootModuleAPI, RootModuleActions } from '@medux/core';
import type { Router } from '@medux/route-browser';
import type { LoadView } from './loadView';
export type { RootModuleFacade, Dispatch, CoreModuleState } from '@medux/core';
export type { RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial, } from '@medux/route-web';
export type { LoadView } from './loadView';
export { ActionTypes, LoadingState, modelHotReplacement, env, effect, errorAction, reducer, viewHotReplacement, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, isProcessedError, setProcessedError, } from '@medux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@medux/route-web';
export { DocumentHead } from './components/DocumentHead';
export { Else } from './components/Else';
export { Switch } from './components/Switch';
export { Link } from './components/Link';
export declare function setSsrHtmlTpl(tpl: string): void;
export declare function setConfig(conf: {
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    pagenames?: {
        [key: string]: string;
    };
    NSP?: string;
    MSP?: string;
    MutableData?: boolean;
    DepthTimeOnLoading?: number;
    LoadViewOnError?: ComponentType<{
        message: string;
    }>;
    LoadViewOnLoading?: ComponentType<{}>;
    disableNativeRoute?: boolean;
}): void;
export declare const exportModule: ExportModule<ComponentType<any>>;
export interface RenderOptions {
    id?: string;
    ssrKey?: string;
}
export interface SSROptions {
    id?: string;
    ssrKey?: string;
    url: string;
}
export declare function createApp(moduleGetter: ModuleGetter, middlewares?: ControllerMiddleware[], appModuleName?: string, appViewName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({ storeOptions, storeCreator }: StoreBuilder<O, B>): {
        render({ id, ssrKey }?: RenderOptions): {
            store: import("@medux/core").IStore<any> & B;
            run(): Promise<void>;
        };
        ssr({ id, ssrKey, url }: SSROptions): {
            store: import("@medux/core").IStore<any> & B;
            run(): Promise<string>;
        };
    };
};
export declare function patchActions(typeName: string, json?: string): void;
export declare type GetAPP<A extends RootModuleFacade, RouteParams extends {
    [K in keyof A]: any;
}, Pagename extends string> = {
    State: {
        [M in keyof A]?: A[M]['state'];
    };
    GetRouter: () => Router<RouteParams, Pagename>;
    GetActions<N extends keyof A>(...args: N[]): {
        [K in N]: A[K]['actions'];
    };
    LoadView: LoadView<A>;
    Modules: RootModuleAPI<A>;
    Actions: RootModuleActions<A>;
    Pagenames: {
        [K in Pagename]: K;
    };
    CCC: A['route']['state']['params'];
};
export declare function getApp<T extends {
    GetActions: any;
    GetRouter: any;
    LoadView: any;
    Modules: any;
    Pagenames: any;
}>(): Pick<T, 'GetActions' | 'GetRouter' | 'LoadView' | 'Modules' | 'Pagenames'>;
