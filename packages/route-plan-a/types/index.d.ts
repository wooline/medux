import { RouteData } from '@medux/core';
export declare function setRouteConfig(conf: {
    escape?: boolean;
    dateParse?: boolean;
    splitKey?: string;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
}): void;
export interface Location {
    pathname: string;
    search: string;
    hash: string;
}
export declare type RouteToLocation = (routeData: RouteData) => Location;
export declare type LocationToRoute = (location: Location) => RouteData;
export interface TransformRoute {
    locationToRoute: LocationToRoute;
    routeToLocation: RouteToLocation;
}
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
export interface BrowserHistoryActions<P = RouteData> {
    push(data: P | Location | string): void;
    replace(data: P | Location | string): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
}
export declare function getBrowserRouteActions<T>(getBrowserHistoryActions: () => BrowserHistoryActions<RouteData>): BrowserHistoryActions<BrowserRoutePayload<T>>;
export interface ToBrowserUrl<T> {
    (routeOptions: BrowserRoutePayload<T>): string;
    (pathname: string, search: string, hash: string): string;
}
export declare function buildToBrowserUrl(getTransformRoute: () => TransformRoute): ToBrowserUrl<any>;
export {};
