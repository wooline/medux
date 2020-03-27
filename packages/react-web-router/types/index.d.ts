import { RootState as BaseRootState, ModuleGetter, StoreOptions } from '@medux/core';
import { History } from 'history';
import { Location, RouteConfig, BrowserRoutePayload, ToBrowserUrl } from '@medux/route-plan-a';
import { ReactElement } from 'react';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
export type { Actions, RouteData, BaseModelState } from '@medux/core';
export type { LoadView } from '@medux/react';
export type { BrowserRoutePayload, RouteConfig, ToBrowserUrl } from '@medux/route-plan-a';
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
