import { BaseRouter, BaseNativeRouter, NativeLocation, NativeData, RootParams, LocationTransform } from '@medux/route-web';
interface RouteOption {
    url: string;
}
interface NavigateBackOption {
    delta?: number;
}
export interface RouteENV {
    onRouteChange(callback: (pathname: string, searchData: {
        [key: string]: string;
    } | undefined, action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH') => void): () => void;
    getLocation(): {
        pathname: string;
        searchData: {
            [key: string]: string;
        } | undefined;
    };
    reLaunch(option: RouteOption): Promise<any>;
    redirectTo(option: RouteOption): Promise<any>;
    navigateTo(option: RouteOption): Promise<any>;
    navigateBack(option: NavigateBackOption): Promise<any>;
    switchTab(option: RouteOption): Promise<any>;
    getCurrentPages: () => Array<{
        route: string;
        options?: {
            [key: string]: string;
        };
    }>;
}
export declare class MPNativeRouter extends BaseNativeRouter {
    routeENV: RouteENV;
    protected tabPages: {
        [path: string]: boolean;
    };
    private _unlistenHistory;
    protected router: Router<any, string>;
    constructor(routeENV: RouteENV, tabPages: {
        [path: string]: boolean;
    });
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
}
export declare function createRouter<P extends RootParams, N extends string>(locationTransform: LocationTransform<P>, routeENV: RouteENV, tabPages: {
    [path: string]: boolean;
}): Router<P, N>;
export {};
