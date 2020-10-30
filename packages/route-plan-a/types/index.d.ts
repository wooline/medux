import { DisplayViews, HistoryProxy, RouteState, RouteParams, RouteData, Location as BaseLocation, HistoryAction } from '@medux/core';
import assignDeep from './deep-extend';
export interface PaRouteData<P extends RouteParams = RouteParams> {
    views: DisplayViews;
    params: P;
    paths: string[];
}
export interface PaLocation {
    pathname: string;
    search: string;
    hash: string;
}
export interface LocationPayload {
    pathname: string;
    search?: string;
    hash?: string;
}
export interface RoutePayload<P extends RouteParams = RouteParams> {
    paths: string[] | string;
    params?: DeepPartial<P>;
    extend?: RouteData<P>;
}
export interface Location extends BaseLocation {
    pathname: string;
    search: string;
    hash: string;
}
export interface NativeLocation {
    key: string;
    url: string;
}
export declare function checkLocation(location: LocationPayload): PaLocation;
export declare function urlToLocation(url: string): PaLocation;
export declare function locationToUrl(safeLocation: PaLocation): string;
export declare const deepAssign: typeof assignDeep;
export declare function setRouteConfig(conf: {
    escape?: boolean;
    dateParse?: boolean;
    splitKey?: string;
    homeUrl?: string;
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
export declare function assignRouteData(paths: string[], params: {
    [moduleName: string]: any;
}): PaRouteData;
export declare type LocationListener<P extends RouteParams> = (routeState: RouteState<Location, P>) => void;
export declare type LocationBlocker<P extends RouteParams> = (location: Location, curLocation: Location | undefined, routeData: RouteData<P>, curRouteData: RouteData<P> | undefined) => void | Promise<void>;
export declare type LocationToLocation = (location: PaLocation) => PaLocation;
export declare type LocationMap = {
    in: LocationToLocation;
    out: LocationToLocation;
};
export interface NativeHistory {
    push(location: Location): void;
    replace(location: Location): void;
    relaunch(location: Location): void;
    pop(n: number): void;
}
export declare abstract class BaseHistoryActions<P extends RouteParams = RouteParams> implements HistoryProxy {
    private _homeUrl;
    nativeHistory: NativeHistory;
    routeConfig: RouteConfig;
    locationMap?: LocationMap | undefined;
    private _tid;
    private _uid;
    private _RSP;
    private _listenList;
    private _blockerList;
    private _location;
    private _routeData;
    private _startupLocation;
    private _startupRouteData;
    private _history;
    private _stack;
    private _viewToRule;
    private _ruleToKeys;
    constructor(_homeUrl: string, nativeHistory: NativeHistory, routeConfig: RouteConfig, locationMap?: LocationMap | undefined);
    init(initLocation: PaLocation): void;
    private _getCurKey;
    private _getCurPathname;
    getLocation(startup?: boolean): Location | undefined;
    getRouteData(startup?: boolean): RouteData<P> | undefined;
    getRouteState(): RouteState<Location, P> | undefined;
    locationToRoute(safeLocation: PaLocation): PaRouteData<P>;
    routeToLocation(paths: string[] | string, params?: RouteParams): PaLocation;
    payloadToRoute(data: RoutePayload<P>): PaRouteData<P>;
    payloadToLocation(data: RoutePayload<P> | LocationPayload | string): PaLocation;
    private _createKey;
    private _getEfficientLocation;
    private _buildHistory;
    subscribe(listener: LocationListener<P>): () => void;
    block(listener: LocationBlocker<P>): () => void;
    private _urlToUri;
    private _uriToUrl;
    private _uriToKey;
    private _findHistoryByKey;
    protected dispatch(paLocation: PaLocation, action: HistoryAction, key?: string, callNative?: string | number): Promise<Location>;
    protected passive(nativeLocation: NativeLocation, action: HistoryAction): void;
    relaunch(data: RoutePayload<P> | LocationPayload | string): Promise<Location>;
    push(data: RoutePayload<P> | LocationPayload | string): Promise<Location>;
    replace(data: RoutePayload<P> | LocationPayload | string): Promise<Location>;
    pop(n?: number, root?: 'HOME' | 'FIRST' | ''): Promise<Location>;
    home(root?: 'HOME' | 'FIRST'): Promise<Location>;
    abstract destroy(): void;
}
export {};
