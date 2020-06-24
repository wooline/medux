import { HistoryProxy, RouteData } from '@medux/core';
import { MeduxLocation, RouteConfig, TransformRoute } from '@medux/route-plan-a';
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
declare type UnregisterCallback = () => void;
declare type LocationListener = (location: MeduxLocation) => void;
declare type LocationBlocker = (location: MeduxLocation, curLocation: MeduxLocation) => boolean | Promise<boolean>;
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
    switchTab(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void>;
    reLaunch(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void>;
    redirectTo(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void>;
    navigateTo(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void>;
    navigateBack(option: number | meduxCore.NavigateBackOption): Promise<void>;
    refresh(method: 'switchTab' | 'reLaunch' | 'redirectTo' | 'navigateTo'): Promise<void>;
    listen(listener: LocationListener): UnregisterCallback;
    block(blocker: LocationBlocker): UnregisterCallback;
    _dispatch(location: MeduxLocation, action: string): Promise<void>;
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
