import { RouteData } from '@medux/core';
import { HistoryActions, TransformRoute } from '@medux/web';
export declare function setRouteConfig(conf: {
    escape?: boolean;
    dateParse?: boolean;
    splitKey?: string;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
}): void;
export interface RouteConfig {
    [path: string]: string | [string, RouteConfig];
}
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export interface RoutePayload<P> {
    extend?: RouteData;
    stackParams?: DeepPartial<P>[];
    paths?: string[];
}
export declare function fillRouteData<R>(routePayload: RoutePayload<R>): RouteData;
export declare function buildTransformRoute(routeConfig: RouteConfig): TransformRoute;
export interface BrowserRoutePayload<P> {
    extend?: RouteData;
    params?: DeepPartial<P>;
    paths?: string[];
}
export declare function fillBrowserRouteData<R>(routePayload: BrowserRoutePayload<R>): RouteData;
export declare type BrowserHistoryActions<T> = HistoryActions<BrowserRoutePayload<T>>;
export declare function getBrowserRouteActions<T>(getBrowserHistoryActions: () => HistoryActions<RouteData>): BrowserHistoryActions<T>;
export interface ToBrowserUrl<T> {
    (routeOptions: BrowserRoutePayload<T>): string;
    (pathname: string, search: string, hash: string): string;
}
export declare function buildToBrowserUrl(getTransformRoute: () => TransformRoute): ToBrowserUrl<any>;
export {};
