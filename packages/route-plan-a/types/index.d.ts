import { CoreModuleHandlers, CoreModuleState } from '@medux/core';
import { Middleware, Reducer } from 'redux';
import { HistoryAction } from './basic';
import assignDeep from './deep-extend';
import type { RouteParams, Location, PaRouteData, PaLocation, RouteState, RoutePayload, RouteRule } from './basic';
export declare const deepAssign: typeof assignDeep;
export type { RootState, PaRouteData, PaLocation, RouteState, RoutePayload, Location, RouteRule, RouteParams } from './basic';
export { setRouteConfig } from './basic';
export declare function assignRouteData(paths: string[], params: {
    [moduleName: string]: any;
}, defaultRouteParams: {
    [moduleName: string]: any;
}): PaRouteData;
export declare type LocationToLocation = (location: PaLocation) => PaLocation;
export declare type LocationMap = {
    in: LocationToLocation;
    out: LocationToLocation;
};
export interface NativeHistory {
    push(location: Location): void;
    replace(location: Location): void;
    relaunch(location: Location): void;
    pop(location: Location, n: number): void;
}
export interface Store {
    dispatch(action: {
        type: string;
    }): any;
}
export declare abstract class BaseHistoryActions<P extends RouteParams = RouteParams> {
    protected nativeHistory: NativeHistory;
    protected defaultRouteParams: {
        [moduleName: string]: any;
    };
    protected initUrl: string;
    protected routeRule: RouteRule;
    protected locationMap?: LocationMap | undefined;
    private _tid;
    private _routeState;
    private _startupRouteState;
    protected store: Store | undefined;
    private _viewToRule;
    private _ruleToKeys;
    private _viewToPaths;
    constructor(nativeHistory: NativeHistory, defaultRouteParams: {
        [moduleName: string]: any;
    }, initUrl: string, routeRule: RouteRule, locationMap?: LocationMap | undefined);
    setStore(_store: Store): void;
    mergeInitState<T extends RouteRootState>(initState: T): RouteRootState;
    getModulePath(): string[];
    protected getCurKey(): string;
    getRouteState(): RouteState<P>;
    locationToUrl(safeLocation: PaLocation): string;
    protected locationToRoute(safeLocation: PaLocation): PaRouteData<P>;
    protected routeToLocation(paths: string[], params?: RouteParams): PaLocation;
    payloadToRoute(data: RoutePayload<P> | string): PaRouteData<P>;
    viewNameToPaths(viewName: string): string[] | undefined;
    payloadToLocation(data: RoutePayload<P> | string): PaLocation;
    private _createKey;
    private _getEfficientLocation;
    private _buildHistory;
    private _urlToUri;
    private _uriToUrl;
    private _uriToPathname;
    private _uriToKey;
    protected findHistoryByKey(key: string): {
        index: number;
        url: string;
    };
    private _toNativeLocation;
    private _createRouteState;
    protected dispatch(safeLocation: PaLocation, action: HistoryAction, key?: string, callNative?: string | number): Promise<RouteState<P>>;
    relaunch(data: RoutePayload<P> | string, disableNative?: boolean): Promise<Location>;
    push(data: RoutePayload<P> | string, disableNative?: boolean): Promise<Location>;
    replace(data: RoutePayload<P> | string, disableNative?: boolean): Promise<Location>;
    pop(n?: number, root?: 'HOME' | 'FIRST' | '', disableNative?: boolean): Promise<Location>;
    home(root?: 'HOME' | 'FIRST', disableNative?: boolean): Promise<Location>;
    abstract destroy(): void;
}
export declare const routeMiddleware: Middleware;
export declare const routeReducer: Reducer;
export interface RouteModuleState<R extends Record<string, any> = {}> extends CoreModuleState {
    routeParams?: R;
}
declare type RouteRootState = {
    [moduleName: string]: RouteModuleState;
} & {
    route: RouteState;
};
export declare class RouteModuleHandlers<S extends RouteModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
    Init(initState: S): S;
    RouteParams(payload: {
        [key: string]: any;
    }): S;
}
