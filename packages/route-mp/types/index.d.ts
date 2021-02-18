/// <reference path="../env/global.d.ts" />
import { BaseRouter, NativeRouter, RootParams, LocationTransform, NativeLocation } from '@medux/route-web';
export declare class MPNativeRouter implements NativeRouter {
    getLocation(): NativeLocation;
    toUrl(url: string, key: string): string;
    onChange(callback: (pathname: string, query: {
        [key: string]: string;
    }, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => void): void;
    push(getUrl: () => string, key: string, internal: boolean): void;
    replace(getUrl: () => string, key: string, internal: boolean): void;
    relaunch(getUrl: () => string, key: string, internal: boolean): void;
    back(getUrl: () => string, n: number, key: string, internal: boolean): void;
    pop(getUrl: () => string, n: number, key: string, internal: boolean): void;
}
export declare class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> {
    nativeRouter: MPNativeRouter;
    constructor(mpNativeRouter: MPNativeRouter, locationTransform: LocationTransform<P>);
    destroy(): void;
}
export declare function createRouter<P extends RootParams, N extends string>(locationTransform: LocationTransform<P>): Router<P, N>;
