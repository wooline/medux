import { RootState as BaseRootState, ModuleGetter, StoreOptions } from '@medux/core/types/export';
import { History } from 'history';
import { Location } from '@medux/route-plan-a';
import { ReactElement } from 'react';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
export declare type RouteData = import('@medux/core/types/export').RouteData;
export declare type LoadView<MG extends ModuleGetter> = import('@medux/react').LoadView<MG>;
export declare type BaseModelState<R = {
    [key: string]: any;
}> = import('@medux/core/types/export').BaseModelState<R>;
export declare type BrowserRoutePayload<P> = import('@medux/route-plan-a').BrowserRoutePayload<P>;
export declare type RouteConfig = import('@medux/route-plan-a').RouteConfig;
export declare type ToBrowserUrl<Params> = import('@medux/route-plan-a').ToBrowserUrl<Params>;
export declare type BrowserHistoryActions<Params> = import('@medux/route-plan-a').BrowserHistoryActions<BrowserRoutePayload<Params>>;
export declare function getBrowserHistory<Params>(): {
    historyActions: BrowserHistoryActions<Params>;
    toUrl: ToBrowserUrl<Params>;
};
export declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, history: History, routeConfig: RouteConfig, storeOptions?: StoreOptions, container?: string | Element | ((component: ReactElement<any>) => void)): Promise<import("redux").Store<any, import("redux").AnyAction>>;
export declare function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, location: string, routeConfig: RouteConfig, storeOptions?: StoreOptions, renderToStream?: boolean): Promise<{
    html: string | ReadableStream;
    data: any;
    ssrInitStoreKey: string;
}>;
export declare type RootState<G extends ModuleGetter> = BaseRootState<G, Location>;
