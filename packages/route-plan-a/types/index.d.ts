import { Middleware, Reducer } from 'redux';
import { CoreModuleHandlers, CoreModuleState } from '@medux/core';
import { History } from './basic';
import type { LocationTransform } from './transform';
import type { RootParams, Location, NativeLocation, RouteState, HistoryAction, RoutePayload } from './basic';
export { createWebLocationTransform } from './transform';
export { PathnameRules, extractPathParams } from './matchPath';
export { setRouteConfig } from './basic';
export type { LocationMap, LocationTransform } from './transform';
export type { RootParams, Location, NativeLocation, RootState, RouteState, HistoryAction, RouteRootState, RoutePayload } from './basic';
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
export declare function beforeRouteChangeAction<P extends RootParams, NL extends NativeLocation>(routeState: RouteState<P, NL>): {
    type: string;
    payload: RouteState<P, NL>[];
};
export declare function routeParamsAction(moduleName: string, params: any, action: HistoryAction): {
    type: string;
    payload: any[];
};
export declare function routeChangeAction<P extends RootParams, NL extends NativeLocation>(routeState: RouteState<P, NL>): {
    type: string;
    payload: RouteState<P, NL>[];
};
export declare const routeMiddleware: Middleware;
export declare const routeReducer: Reducer;
export interface NativeRouter<NL extends NativeLocation = NativeLocation> {
    parseUrl(url: string): NL;
    toUrl(location: NL): string;
    push(location: NL, key: string): void;
    replace(location: NL, key: string): void;
    relaunch(location: NL, key: string): void;
    back(location: NL, n: number, key: string): void;
    pop(location: NL, n: number, key: string): void;
}
export declare abstract class BaseRouter<P extends RootParams, NL extends NativeLocation = NativeLocation> {
    protected nativeRouter: NativeRouter<NL>;
    protected locationTransform: LocationTransform<P, NL>;
    private _tid;
    private _routeState;
    protected store: Store | undefined;
    readonly history: History;
    constructor(initLocation: NL, nativeRouter: NativeRouter<NL>, locationTransform: LocationTransform<P, NL>);
    getRouteState(): RouteState<P, NL>;
    setStore(_store: Store): void;
    protected getCurKey(): string;
    private _createKey;
    payloadToLocation(data: RoutePayload<P> | string): Location<P>;
    locationToUrl(data: RoutePayload<P>): string;
    locationToRouteState(location: Location<P>, action: HistoryAction, key: string): RouteState<P, NL>;
    relaunch(data: RoutePayload<P> | string, internal?: boolean): Promise<RouteState<P, NL>>;
    push(data: RoutePayload<P> | string, internal?: boolean): Promise<RouteState<P, NL>>;
    replace(data: RoutePayload<P> | string, internal?: boolean): Promise<RouteState<P, NL>>;
    back(n?: number, internal?: boolean): Promise<RouteState<P, NL>>;
    pop(n?: number, internal?: boolean): Promise<RouteState<P, NL>>;
    abstract destroy(): void;
}
