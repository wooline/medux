import { History, LocationListener, UnregisterCallback } from 'history';
import { HistoryProxy, RouteData } from '@medux/core';
import { MeduxLocation, RouteConfig, TransformRoute } from '@medux/route-plan-a';
export { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';
export interface BrowserRoutePayload<P = {}> {
    extend?: RouteData;
    params?: DeepPartial<P>;
    paths?: string[];
}
export interface HistoryActions<P = {}> {
    listen(listener: LocationListener<never>): UnregisterCallback;
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
interface BrowserLocation {
    pathname: string;
    search: string;
    hash: string;
    state: RouteData;
}
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
