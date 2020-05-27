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
export declare type LocationToLocation = (location: MeduxLocation) => MeduxLocation;
export declare type LocationMap = {
    in: LocationToLocation;
    out: LocationToLocation;
};
export interface History {
    location: BrowserLocation;
    push(path: string, state?: any): void;
    replace(path: string, state?: any): void;
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
    location: MeduxLocation;
    getRouteData(): RouteData;
    push(data: BrowserRoutePayload<P> | Partial<MeduxLocation> | string): void;
    replace(data: BrowserRoutePayload<P> | Partial<MeduxLocation> | string): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
}
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export declare function fillBrowserRouteData(routePayload: BrowserRoutePayload): RouteData;
export declare function createRouter(history: History, routeConfig: RouteConfig, locationMap?: LocationMap): {
    transformRoute: TransformRoute;
    historyProxy: HistoryProxy<BrowserLocation>;
    historyActions: HistoryActions<{}>;
    toBrowserUrl: <P = {}>(data: Partial<MeduxLocation> | BrowserRoutePayload<P>) => string;
};
export declare type ToBrowserUrl<T = {}> = (routeOptions: BrowserRoutePayload<T> | Partial<MeduxLocation>) => string;
export {};
