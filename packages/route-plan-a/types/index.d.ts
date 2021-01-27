import { Middleware, Reducer } from 'redux';
import { CoreModuleHandlers, CoreModuleState } from '@medux/core';
import { History } from './basic';
import type { LocationTransform } from './transform';
import type { RootParams, Location, NativeLocation, RouteState, HistoryAction, RoutePayload } from './basic';
export { setRouteConfig } from './basic';
export { PagenameMap, createLocationTransform, createPathnameTransform } from './transform';
export type { LocationTransform, PathnameTransform } from './transform';
export type { RootParams, Location, NativeLocation, RootState, RouteState, HistoryAction, RouteRootState, RoutePayload, DeepPartial } from './basic';
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
    push(url: string, key: string, internal: boolean): void;
    replace(url: string, key: string, internal: boolean): void;
    relaunch(url: string, key: string, internal: boolean): void;
    back(url: string, n: number, key: string, internal: boolean): void;
    pop(url: string, n: number, key: string, internal: boolean): void;
}
export declare abstract class BaseRouter<P extends RootParams> {
    protected nativeRouter: NativeRouter;
    protected locationTransform: LocationTransform<P>;
    private _tid;
    private routeState;
    private nativeLocation;
    private url;
    protected store: Store | undefined;
    readonly history: History;
    constructor(initUrl: string, nativeRouter: NativeRouter, locationTransform: LocationTransform<P>);
    getRouteState(): RouteState<P>;
    getNativeLocation(): NativeLocation;
    getUrl(): string;
    setStore(_store: Store): void;
    protected getCurKey(): string;
    private _createKey;
    payloadToLocation(data: RoutePayload<P>): Location<P>;
    urlToToLocation(url: string): Location<P>;
    urlToNativeLocation(url: string): NativeLocation;
    nativeLocationToUrl(nativeLocation: NativeLocation): string;
    locationToUrl(location: Location<P>): string;
    relaunch(data: RoutePayload<P> | string, internal?: boolean): Promise<RouteState<P>>;
    push(data: RoutePayload<P> | string, internal?: boolean): Promise<RouteState<P>>;
    replace(data: RoutePayload<P> | string, internal?: boolean): Promise<RouteState<P>>;
    back(n?: number, internal?: boolean): Promise<RouteState<P>>;
    pop(n?: number, internal?: boolean): Promise<RouteState<P>>;
    abstract destroy(): void;
}
