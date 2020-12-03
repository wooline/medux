import { BaseHistoryActions, NativeLocation, NativeHistory, LocationTransform, Params } from '@medux/route-plan-a';
import { History, Location as HistoryLocation } from 'history';
export declare class WebNativeHistory implements NativeHistory {
    history: History<never>;
    constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string);
    getLocation(): NativeLocation;
    getUrl(): string;
    parseUrl(url: string): NativeLocation;
    toUrl(location: NativeLocation): string;
    block(blocker: (url: string, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => false | void): import("history").UnregisterCallback;
    getKey(location: HistoryLocation): string;
    push(location: NativeLocation, key: string): void;
    replace(location: NativeLocation, key: string): void;
    relaunch(location: NativeLocation, key: string): void;
    pop(location: NativeLocation, n: number, key: string): void;
}
export declare class HistoryActions<P extends Params = Params> extends BaseHistoryActions<P> {
    protected nativeHistory: WebNativeHistory;
    private _unlistenHistory;
    private _timer;
    constructor(nativeHistory: WebNativeHistory, locationTransform?: LocationTransform<P>);
    getNativeHistory(): History<never>;
    destroy(): void;
    refresh(): void;
}
export declare function createRouter<P extends Params = Params>(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationTransform?: LocationTransform<P>): HistoryActions<P>;
