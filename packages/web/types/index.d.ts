import { BaseRouter, NativeRouter, RootParams, LocationTransform } from '@medux/route-plan-a';
import { History } from 'history';
export declare class BrowserNativeRouter implements NativeRouter {
    history: History<never>;
    constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string);
    getUrl(): string;
    block(blocker: (url: string, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => false | void): import("history").UnregisterCallback;
    private getKey;
    push(url: string, key: string, internal: boolean): void;
    replace(url: string, key: string, internal: boolean): void;
    relaunch(url: string, key: string, internal: boolean): void;
    back(url: string, n: number, key: string, internal: boolean): void;
    pop(url: string, n: number, key: string, internal: boolean): void;
}
export declare class Router<P extends RootParams = RootParams> extends BaseRouter<P> {
    private _unlistenHistory;
    private _timer;
    constructor(browserNativeRouter: BrowserNativeRouter, locationTransform: LocationTransform<P>);
    destroy(): void;
}
export declare function createRouter<P extends RootParams = RootParams>(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationTransform: LocationTransform<P>): Router<P>;
