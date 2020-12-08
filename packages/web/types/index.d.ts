import { BaseHistoryActions, NativeHistory } from '@medux/route-plan-a';
import { History, Location as HistoryLocation } from 'history';
import { RootModuleFacade } from '@medux/core';
import type { RootState as BaseRootState, RootParams, RouteState as BaseRouteState, LocationTransform as BaseLocationTransform, WebNativeLocation } from '@medux/route-plan-a';
export declare type RouteState<P extends RootParams> = BaseRouteState<P, WebNativeLocation>;
export declare type RootState<A extends RootModuleFacade, P extends RootParams> = BaseRootState<A, P, WebNativeLocation>;
export declare type LocationTransform<P extends RootParams> = BaseLocationTransform<P, WebNativeLocation>;
export declare class WebNativeHistory implements NativeHistory<WebNativeLocation> {
    history: History<never>;
    constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string);
    getLocation(): WebNativeLocation;
    getUrl(): string;
    parseUrl(url: string): WebNativeLocation;
    toUrl(location: WebNativeLocation): string;
    block(blocker: (url: string, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => false | void): import("history").UnregisterCallback;
    getKey(location: HistoryLocation): string;
    push(location: WebNativeLocation, key: string): void;
    replace(location: WebNativeLocation, key: string): void;
    relaunch(location: WebNativeLocation, key: string): void;
    pop(location: WebNativeLocation, n: number, key: string): void;
}
export declare class HistoryActions<P extends RootParams = RootParams> extends BaseHistoryActions<P, WebNativeLocation> {
    protected nativeHistory: WebNativeHistory;
    private _unlistenHistory;
    private _timer;
    constructor(nativeHistory: WebNativeHistory, locationTransform: LocationTransform<P>);
    getNativeHistory(): History<never>;
    destroy(): void;
    refresh(): void;
}
export declare function createRouter<P extends RootParams = RootParams>(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationTransform: LocationTransform<P>): HistoryActions<P>;
