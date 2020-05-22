import { HistoryProxy, RouteData } from '@medux/core';
import { MeduxLocation, RouteConfig, TransformRoute } from '@medux/route-plan-a';
interface BrowserLocation {
    pathname: string;
    search: string;
    hash: string;
    state: any;
}
declare type UnregisterCallback = () => void;
declare type LocationListener = (location: BrowserLocation) => void;
export interface History {
    location: BrowserLocation;
    push(path: string, state?: any): void;
    push(location: BrowserLocation): void;
    replace(path: string, state?: any): void;
    replace(location: BrowserLocation): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
    listen(listener: LocationListener): UnregisterCallback;
}
export interface BrowserRoutePayload<P = {}> {
    extend?: RouteData;
    params?: DeepPartial<P>;
    paths?: string[];
}
export interface HistoryActions<P = {}> {
    listen(listener: LocationListener): UnregisterCallback;
    getLocation(): MeduxLocation;
    getRouteData(): RouteData;
    push(data: BrowserRoutePayload<P> | MeduxLocation | string): void;
    replace(data: BrowserRoutePayload<P> | MeduxLocation | string): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
}
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export declare function fillBrowserRouteData(routePayload: BrowserRoutePayload): RouteData;
export declare function createRouter(history: History, routeConfig: RouteConfig): {
    transformRoute: TransformRoute;
    historyProxy: HistoryProxy<BrowserLocation>;
    historyActions: HistoryActions<{}>;
    toBrowserUrl: ToBrowserUrl<{}>;
};
export interface ToBrowserUrl<T = {}> {
    (routeOptions: BrowserRoutePayload<T>): string;
    (pathname: string, search: string, hash: string): string;
}
export {};
