import { Middleware, Reducer } from 'redux';
import { CoreModuleHandlers, CoreModuleState } from '@medux/core';
import { History } from './basic';
import type { LocationTransform } from './transform';
import type { RootParams, Location, NativeLocation, RouteState, HistoryAction, PayloadLocation, PartialLocation } from './basic';
export { setRouteConfig, routeConfig } from './basic';
export { PagenameMap, createLocationTransform } from './transform';
export type { LocationTransform } from './transform';
export type { RootParams, Location, NativeLocation, RootState, RouteState, HistoryAction, RouteRootState, DeepPartial, PayloadLocation } from './basic';
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
export declare function beforeRouteChangeAction<P extends {
    [key: string]: any;
}>(routeState: RouteState<P>): {
    type: string;
    payload: RouteState<P>[];
};
export declare function routeParamsAction(moduleName: string, params: any, action: HistoryAction): {
    type: string;
    payload: any[];
};
export declare function routeChangeAction<P extends {
    [key: string]: any;
}>(routeState: RouteState<P>): {
    type: string;
    payload: RouteState<P>[];
};
export declare const routeMiddleware: Middleware;
export declare const routeReducer: Reducer;
export interface NativeRouter {
    push(getNativeUrl: () => string, key: string, internal: boolean): void;
    replace(getNativeUrl: () => string, key: string, internal: boolean): void;
    relaunch(getNativeUrl: () => string, key: string, internal: boolean): void;
    back(getNativeUrl: () => string, n: number, key: string, internal: boolean): void;
    pop(getNativeUrl: () => string, n: number, key: string, internal: boolean): void;
}
export declare abstract class BaseRouter<P extends RootParams, N extends string> {
    nativeRouter: NativeRouter;
    protected locationTransform: LocationTransform<P>;
    private _tid;
    private _nativeData;
    private _getNativeUrl;
    private routeState;
    private url;
    protected store: Store | undefined;
    readonly history: History;
    constructor(nativeUrl: string, nativeRouter: NativeRouter, locationTransform: LocationTransform<P>);
    getRouteState(): RouteState<P>;
    getPagename(): string;
    getParams(): Partial<P>;
    getUrl(): string;
    getNativeLocation(): NativeLocation;
    getNativeUrl(): string;
    setStore(_store: Store): void;
    protected getCurKey(): string;
    private _createKey;
    nativeUrlToNativeLocation(url: string): NativeLocation;
    urlToLocation(url: string): Location<P>;
    nativeLocationToNativeUrl(nativeLocation: NativeLocation): string;
    locationToNativeUrl(location: PartialLocation<P>): string;
    locationToUrl(location: PartialLocation<P>): string;
    payloadToPartial(payload: PayloadLocation<P, N>): PartialLocation<P>;
    relaunch(data: PayloadLocation<P, N> | string, internal?: boolean): Promise<RouteState<P>>;
    push(data: PayloadLocation<P, N> | string, internal?: boolean): Promise<RouteState<P>>;
    replace(data: PayloadLocation<P, N> | string, internal?: boolean): Promise<RouteState<P>>;
    back(n?: number, internal?: boolean): Promise<RouteState<P>>;
    pop(n?: number, internal?: boolean): Promise<RouteState<P>>;
    abstract destroy(): void;
}
