import { HistoryProxy, RouteData } from '@medux/core';
import { MeduxLocation, RouteConfig, TransformRoute } from '@medux/route-plan-a';
declare type UnregisterCallback = () => void;
interface BrowserLocation {
    pathname: string;
    search: string;
    hash: string;
}
declare type MeduxLocationListener = (location: MeduxLocation) => void;
export declare type LocationToLocation = (location: MeduxLocation) => MeduxLocation;
export declare type LocationMap = {
    in: LocationToLocation;
    out: LocationToLocation;
};
export interface History {
    location: BrowserLocation;
    action: string;
    push(path: string): void;
    replace(path: string): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
    listen(listener: (location: BrowserLocation, action: string) => void): UnregisterCallback;
}
export interface BrowserRoutePayload<P = {}> {
    extend?: RouteData;
    params?: DeepPartial<P>;
    paths?: string[];
    action?: string;
}
export interface HistoryActions<P = {}> {
    listen(listener: MeduxLocationListener): UnregisterCallback;
    getLocation(): MeduxLocation;
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
    historyProxy: HistoryProxy<MeduxLocation>;
    historyActions: HistoryActions<{}>;
    toBrowserUrl: <P = {}>(data: Partial<MeduxLocation> | BrowserRoutePayload<P>) => string;
};
export declare type ToBrowserUrl<T = {}> = (routeOptions: BrowserRoutePayload<T> | Partial<MeduxLocation>) => string;
export {};
