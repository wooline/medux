import { HistoryProxy, RouteData } from '@medux/core';
import { MeduxLocation, RouteConfig, TransformRoute } from '@medux/route-plan-a';
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
declare type UnregisterCallback = () => void;
declare type LocationListener = (location: MeduxLocation) => void;
export declare type LocationToLocation = (location: MeduxLocation) => MeduxLocation;
export declare type LocationMap = {
    in: LocationToLocation;
    out: LocationToLocation;
};
interface BrowserRoutePayload<P = {}> {
    extend?: RouteData;
    params?: DeepPartial<P>;
    paths?: string[];
    action?: string;
}
export interface HistoryActions<P = {}> {
    getLocation(): MeduxLocation;
    getRouteData(): RouteData;
    switchTab(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
    reLaunch(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
    redirectTo(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
    navigateTo(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
    navigateBack(option: number | meduxCore.NavigateBackOption): void;
    listen(listener: LocationListener): UnregisterCallback;
    _dispatch(location: MeduxLocation, action: string): void;
}
export declare function fillBrowserRouteData(routePayload: BrowserRoutePayload): RouteData;
export declare function createRouter(routeConfig: RouteConfig, locationMap?: LocationMap): {
    transformRoute: TransformRoute;
    historyProxy: HistoryProxy<MeduxLocation>;
    historyActions: HistoryActions<{}>;
    toBrowserUrl: <P = {}>(data: Partial<MeduxLocation> | BrowserRoutePayload<P>) => string;
};
export declare type ToBrowserUrl<T = {}> = (routeOptions: BrowserRoutePayload<T> | Partial<MeduxLocation>) => string;
export {};
