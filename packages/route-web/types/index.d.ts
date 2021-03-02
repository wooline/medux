import { Middleware, Reducer } from 'redux';
import { CoreModuleHandlers, CoreModuleState } from '@medux/core';
import { History } from './basic';
import type { LocationTransform } from './transform';
import type { RootParams, Location, NativeLocation, RouteState, HistoryAction, PayloadLocation, PartialLocation } from './basic';
export { setRouteConfig, routeConfig, nativeUrlToNativeLocation } from './basic';
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
export declare type NativeData = {
    nativeLocation: NativeLocation;
    nativeUrl: string;
};
interface RouterTask {
    method: string;
}
interface NativeRouterTask {
    resolve: (nativeData: NativeData | undefined) => void;
    reject: () => void;
    nativeData: undefined | NativeData;
}
export declare abstract class BaseNativeRouter {
    protected curTask?: NativeRouterTask;
    protected taskList: RouterTask[];
    protected router: BaseRouter<any, string>;
    protected abstract push(getNativeData: () => NativeData, key: string, internal: boolean): void | NativeData | Promise<NativeData>;
    protected abstract replace(getNativeData: () => NativeData, key: string, internal: boolean): void | NativeData | Promise<NativeData>;
    protected abstract relaunch(getNativeData: () => NativeData, key: string, internal: boolean): void | NativeData | Promise<NativeData>;
    protected abstract back(getNativeData: () => NativeData, n: number, key: string, internal: boolean): void | NativeData | Promise<NativeData>;
    protected abstract pop(getNativeData: () => NativeData, n: number, key: string, internal: boolean): void | NativeData | Promise<NativeData>;
    abstract destroy(): void;
    protected onChange(key: string): boolean;
    setRouter(router: BaseRouter<any, string>): void;
    execute(method: 'relaunch' | 'push' | 'replace' | 'back' | 'pop', getNativeData: () => NativeData, ...args: any[]): Promise<NativeData | undefined>;
}
export declare abstract class BaseRouter<P extends RootParams, N extends string> {
    nativeRouter: BaseNativeRouter;
    protected locationTransform: LocationTransform<P>;
    private _tid;
    private curTask?;
    private taskList;
    private _nativeData;
    private routeState;
    private meduxUrl;
    protected store: Store | undefined;
    readonly history: History;
    constructor(nativeLocationOrNativeUrl: NativeLocation | string, nativeRouter: BaseNativeRouter, locationTransform: LocationTransform<P>);
    getRouteState(): RouteState<P>;
    getPagename(): string;
    getParams(): Partial<P>;
    getMeduxUrl(): string;
    getNativeLocation(): NativeLocation;
    getNativeUrl(): string;
    setStore(_store: Store): void;
    getCurKey(): string;
    searchKeyInActions(key: string): number;
    private _createKey;
    nativeUrlToNativeLocation(url: string): NativeLocation;
    nativeLocationToLocation(nativeLocation: NativeLocation): Location<P>;
    nativeUrlToLocation(nativeUrl: string): Location<P>;
    urlToLocation(url: string): Location<P>;
    nativeLocationToNativeUrl(nativeLocation: NativeLocation): string;
    locationToNativeUrl(location: PartialLocation<P>): string;
    locationToMeduxUrl(location: PartialLocation<P>): string;
    payloadToPartial(payload: PayloadLocation<P, N>): PartialLocation<P>;
    relaunch(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
    private _relaunch;
    push(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
    _push(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean, disableNative: boolean): Promise<RouteState<P>>;
    replace(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
    _replace(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean, disableNative: boolean): Promise<RouteState<P>>;
    back(n?: number, internal?: boolean, disableNative?: boolean): void;
    _back(n: number | undefined, internal: boolean, disableNative: boolean): Promise<RouteState<P>>;
    pop(n?: number, internal?: boolean, disableNative?: boolean): void;
    _pop(n: number | undefined, internal: boolean, disableNative: boolean): Promise<RouteState<P>>;
    private taskComplete;
    private executeTask;
    private addTask;
    destroy(): void;
}
