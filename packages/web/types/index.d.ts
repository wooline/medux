import { BaseHistoryActions, Location, RouteConfig, NativeHistory, LocationMap, PaLocation } from '@medux/route-plan-a';
import { History, Location as HistoryLocation } from 'history';
import { RouteParams } from '@medux/core';
export declare class WebNativeHistory implements NativeHistory {
    locationMap?: LocationMap | undefined;
    history: History;
    initLocation: PaLocation;
    actions: HistoryActions | undefined;
    constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationMap?: LocationMap | undefined);
    block(blocker: (location: HistoryLocation, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => false | void): import("history").UnregisterCallback;
    getKey(location: HistoryLocation): string;
    push(location: Location): void;
    replace(location: Location): void;
    relaunch(location: Location): void;
    pop(location: Location, n: number): void;
}
export declare class HistoryActions<P extends RouteParams = RouteParams> extends BaseHistoryActions<P> {
    nativeHistory: WebNativeHistory;
    homeUrl: string;
    routeConfig: RouteConfig;
    maxLength: number;
    locationMap?: LocationMap | undefined;
    private _unlistenHistory;
    constructor(nativeHistory: WebNativeHistory, homeUrl: string, routeConfig: RouteConfig, maxLength: number, locationMap?: LocationMap | undefined);
    destroy(): void;
}
export declare function createRouter(createHistory: 'Browser' | 'Hash' | 'Memory' | string, homeUrl: string, routeConfig: RouteConfig, locationMap?: LocationMap): HistoryActions<RouteParams>;
