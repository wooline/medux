import { RootState as BaseRootState, ModuleGetter, StoreOptions } from '@medux/core/types/export';
import { BrowserHistoryActions, BrowserRoutePayload, Location, RouteConfig, ToBrowserUrl } from '@medux/route-plan-a';
import { History } from 'history';
import { ReactElement } from 'react';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
export declare type RouteData = import('@medux/core/types/export').RouteData;
export declare type BaseModelState<R = {
    [key: string]: any;
}> = import('@medux/core/types/export').BaseModelState<R>;
export declare type BrowserRoutePayloadd<P> = import('@medux/route-plan-a').BrowserRoutePayload<P>;
export declare type RouteConfig = import('@medux/route-plan-a').RouteConfig;
export declare type ToBrowserUrl<T> = import('@medux/route-plan-a').ToBrowserUrl<T>;
export declare function getBrowserHistoryActions<T>(): BrowserHistoryActions<BrowserRoutePayload<T>>;
export declare const toBrowserUrl: ToBrowserUrl<any>;
export declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, history: History, routeConfig: RouteConfig, storeOptions?: StoreOptions, container?: string | Element | ((component: ReactElement<any>) => void)): Promise<import("redux").Store<any, import("redux").AnyAction>>;
export declare function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, location: string, routeConfig: RouteConfig, storeOptions?: StoreOptions, renderToStream?: boolean): Promise<{
    html: string | ReadableStream;
    data: any;
    ssrInitStoreKey: string;
}>;
export declare type RootState<G extends ModuleGetter> = BaseRootState<G, Location>;
