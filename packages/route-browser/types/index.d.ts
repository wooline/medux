import { BaseRouter, NativeRouter, RootParams, LocationTransform } from '@medux/route-web';
import { History } from 'history';
export declare class BrowserNativeRouter implements NativeRouter {
    history: History<never>;
    private serverSide;
    constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string);
    getUrl(): string;
    block(blocker: (url: string, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => false | void): import("history").UnregisterCallback;
    private getKey;
    push(getUrl: () => string, key: string, internal: boolean): void;
    replace(getUrl: () => string, key: string, internal: boolean): void;
    relaunch(getUrl: () => string, key: string, internal: boolean): void;
    back(getUrl: () => string, n: number, key: string, internal: boolean): void;
    pop(getUrl: () => string, n: number, key: string, internal: boolean): void;
    refresh(): void;
}
export declare class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> {
    private _unlistenHistory;
    private _timer;
    nativeRouter: BrowserNativeRouter;
    constructor(browserNativeRouter: BrowserNativeRouter, locationTransform: LocationTransform<P>);
    destroy(): void;
}
export declare function createRouter<P extends RootParams, N extends string>(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationTransform: LocationTransform<P>): Router<P, N>;
