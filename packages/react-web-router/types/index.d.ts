import { RootState as BaseRootState, ModuleGetter, StoreOptions } from '@medux/core/types/export';
import { BrowserHistoryActions, BrowserRoutePayload, RouteConfig } from '@medux/route-plan-a';
import { History } from 'history';
import { Location } from '@medux/web';
import { ReactElement } from 'react';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
export declare function getHistoryActions<T>(): BrowserHistoryActions<BrowserRoutePayload<T>>;
export interface ToUrl<T> {
    (routeOptions: BrowserRoutePayload<T>): string;
    (pathname: string, search: string, hash: string): string;
}
export declare function toUrl(routeOptions: BrowserRoutePayload<any>): string;
export declare function toUrl(pathname: string, search: string, hash: string): string;
export declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, history: History, routeConfig: RouteConfig, storeOptions?: StoreOptions, container?: string | Element | ((component: ReactElement<any>) => void)): Promise<import("redux").Store<any, import("redux").AnyAction>>;
export declare function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, location: string, routeConfig: RouteConfig, storeOptions?: StoreOptions, renderToStream?: boolean): Promise<{
    html: string | ReadableStream;
    data: any;
    ssrInitStoreKey: string;
}>;
export declare type RootState<G extends ModuleGetter> = BaseRootState<G, Location>;
