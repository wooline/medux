import { Middleware, Reducer } from 'redux';
import { CoreModuleHandlers, CoreModuleState } from '@medux/core';
import type { LocationTransform } from './transform';
import type { Params, Location, NativeLocation, RouteState, HistoryAction, RoutePayload } from './basic';
export { createLocationTransform } from './transform';
export { setRouteConfig } from './basic';
export type { LocationMap, LocationTransform } from './transform';
export type { Params, Location, NativeLocation, RootState, RouteState, HistoryAction, RouteRootState, RoutePayload } from './basic';
interface Store {
    dispatch(action: {
        type: string;
    }): any;
}
export declare type RouteModuleState<P extends {
    [key: string]: any;
} = {}> = CoreModuleState & P;
export declare class RouteModuleHandlers<S extends CoreModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
    Init(initState: S): S;
    RouteParams(payload: Partial<S>): S;
}
export declare const RouteActionTypes: {
    MRouteParams: string;
    RouteChange: string;
    BeforeRouteChange: string;
};
export declare function beforeRouteChangeAction(routeState: RouteState): {
    type: string;
    payload: RouteState<Params>[];
};
export declare function routeParamsAction(moduleName: string, params: any, action: HistoryAction): {
    type: string;
    payload: any[];
};
export declare function routeChangeAction(routeState: RouteState): {
    type: string;
    payload: RouteState<Params>[];
};
export declare const routeMiddleware: Middleware;
export declare const routeReducer: Reducer;
export interface NativeHistory {
    getLocation(): NativeLocation;
    parseUrl(url: string): NativeLocation;
    toUrl(location: NativeLocation): string;
    push(location: NativeLocation, key: string): void;
    replace(location: NativeLocation, key: string): void;
    relaunch(location: NativeLocation, key: string): void;
    pop(location: NativeLocation, n: number, key: string): void;
}
export declare abstract class BaseHistoryActions<P extends Params = Params> {
    protected nativeHistory: NativeHistory;
    private _tid;
    private _routeState;
    private _startupUri;
    protected locationTransform: LocationTransform<P>;
    protected store: Store | undefined;
    constructor(nativeHistory: NativeHistory, locationTransform?: LocationTransform<P>);
    getRouteState(): RouteState<P>;
    setStore(_store: Store): void;
    protected getCurKey(): string;
    private _createKey;
    protected findHistoryByKey(key: string): number;
    payloadToLocation(data: RoutePayload<P> | string): Location<P>;
    locationToUrl(data: RoutePayload<P>): string;
    locationToRouteState(location: Location<P>, action: HistoryAction, key: string): RouteState<P>;
    protected dispatch(location: Location<P>, action: HistoryAction, key?: string, callNative?: string | number): Promise<RouteState<P>>;
    relaunch(data: RoutePayload<P> | string, disableNative?: boolean): Promise<RouteState<P>>;
    push(data: RoutePayload<P> | string, disableNative?: boolean): Promise<RouteState<P>>;
    replace(data: RoutePayload<P> | string, disableNative?: boolean): Promise<RouteState<P>>;
    pop(n?: number, root?: 'HOME' | 'FIRST' | '', disableNative?: boolean, useStack?: boolean): Promise<RouteState<P>>;
    back(n?: number, root?: 'HOME' | 'FIRST' | '', disableNative?: boolean): Promise<RouteState<P>>;
    home(root?: 'HOME' | 'FIRST', disableNative?: boolean): Promise<RouteState<P>>;
    abstract destroy(): void;
}
