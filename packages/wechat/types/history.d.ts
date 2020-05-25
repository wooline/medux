import { HistoryProxy, RouteData } from '@medux/core';
import { MeduxLocation, RouteConfig, PathnameMap, TransformRoute } from '@medux/route-plan-a';
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
declare type UnregisterCallback = () => void;
declare type LocationListener = (location: MeduxLocation) => void;
interface BrowserRoutePayload<P = {}> {
    extend?: RouteData;
    params?: DeepPartial<P>;
    paths?: string[];
}
export interface HistoryActions<P = {}> {
    location: MeduxLocation;
    switchTab(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
    reLaunch(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
    redirectTo(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
    navigateTo(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
    navigateBack(option: number | meduxCore.NavigateBackOption): void;
    listen(listener: LocationListener): UnregisterCallback;
}
export declare function fillBrowserRouteData(routePayload: BrowserRoutePayload): RouteData;
export declare function createRouter(routeConfig: RouteConfig, pathnameMap?: PathnameMap): {
    transformRoute: TransformRoute;
    historyProxy: HistoryProxy<MeduxLocation>;
    historyActions: HistoryActions<{}>;
    toBrowserUrl: ToBrowserUrl<{}>;
};
export interface ToBrowserUrl<T = {}> {
    (routeOptions: BrowserRoutePayload<T>): string;
    (pathname: string, search: string, hash: string): string;
}
export {};
