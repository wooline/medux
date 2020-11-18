import { BaseHistoryActions, Location, RouteRule, NativeHistory, LocationMap, PaLocation, RouteParams } from '@medux/route-plan-a';
import { History, Location as HistoryLocation } from 'history';
export declare class WebNativeHistory implements NativeHistory {
    locationMap?: LocationMap | undefined;
    history: History<never>;
    constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationMap?: LocationMap | undefined);
    block(blocker: (location: PaLocation, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => false | void): import("history").UnregisterCallback;
    getUrl(): string;
    getKey(location: HistoryLocation): string;
    push(location: Location): void;
    replace(location: Location): void;
    relaunch(location: Location): void;
    pop(location: Location, n: number): void;
}
export declare class HistoryActions<P extends RouteParams = RouteParams> extends BaseHistoryActions<P> {
    protected nativeHistory: WebNativeHistory;
    protected defaultRouteParams: {
        [moduleName: string]: any;
    };
    protected routeRule: RouteRule;
    protected locationMap?: LocationMap | undefined;
    private _unlistenHistory;
    private _timer;
    constructor(nativeHistory: WebNativeHistory, defaultRouteParams: {
        [moduleName: string]: any;
    }, routeRule: RouteRule, locationMap?: LocationMap | undefined);
    getNativeHistory(): History<never>;
    destroy(): void;
    refresh(): void;
}
export declare function createRouter(createHistory: 'Browser' | 'Hash' | 'Memory' | string, defaultRouteParams: {
    [moduleName: string]: any;
}, routeRule: RouteRule, locationMap?: LocationMap): HistoryActions<RouteParams>;
