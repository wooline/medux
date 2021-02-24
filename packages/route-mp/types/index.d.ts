import { BaseRouter, BaseNativeRouter, NativeLocation, NativeData, RootParams, LocationTransform } from '@medux/route-web';
interface RouteOption {
    url: string;
}
interface NavigateBackOption {
    delta?: number;
}
export interface RouteENV {
    onRouteChange(callback: (pathname: string, query: {
        [key: string]: string;
    }, action: 'PUSH' | 'POP' | 'REPLACE') => void): () => void;
    getLocation(): {
        pathname: string;
        query: {
            [key: string]: string;
        };
    };
    reLaunch(option: RouteOption): Promise<void>;
    redirectTo(option: RouteOption): Promise<void>;
    navigateTo(option: RouteOption): Promise<void>;
    navigateBack(option: NavigateBackOption): Promise<void>;
    getCurrentPages: () => Array<{
        route: string;
        options: {
            [key: string]: string;
        };
    }>;
}
export declare class MPNativeRouter extends BaseNativeRouter {
    env: RouteENV;
    private _unlistenHistory;
    protected router: Router<any, string>;
    constructor(env: RouteENV);
    getLocation(): NativeLocation;
    protected toUrl(url: string, key: string): string;
    protected push(getNativeData: () => NativeData, key: string, internal: boolean): Promise<NativeData> | undefined;
    protected replace(getNativeData: () => NativeData, key: string, internal: boolean): Promise<NativeData> | undefined;
    protected relaunch(getNativeData: () => NativeData, key: string, internal: boolean): Promise<NativeData> | undefined;
    protected back(getNativeData: () => NativeData, n: number, key: string, internal: boolean): Promise<NativeData> | undefined;
    protected pop(getNativeData: () => NativeData, n: number, key: string, internal: boolean): Promise<NativeData> | undefined;
    destroy(): void;
}
export declare class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> {
    nativeRouter: MPNativeRouter;
    constructor(mpNativeRouter: MPNativeRouter, locationTransform: LocationTransform<P>);
    searchKey(key: string): number;
}
export declare function createRouter<P extends RootParams, N extends string>(locationTransform: LocationTransform<P>, env: RouteENV): Router<P, N>;
export {};
