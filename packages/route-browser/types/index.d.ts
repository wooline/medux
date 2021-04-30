import { BaseRouter, BaseNativeRouter, NativeData, RootParams, LocationTransform, IBaseRouter } from '@medux/route-web';
import { History } from 'history';
export declare class BrowserNativeRouter extends BaseNativeRouter {
    private _unlistenHistory;
    protected router: Router<any, string>;
    history: History<never>;
    private serverSide;
    constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string);
    getUrl(): string;
    private getKey;
    protected passive(url: string, key: string, action: string): boolean;
    refresh(): void;
    protected push(getNativeData: () => NativeData, key: string): NativeData | undefined;
    protected replace(getNativeData: () => NativeData, key: string): NativeData | undefined;
    protected relaunch(getNativeData: () => NativeData, key: string): NativeData | undefined;
    protected back(getNativeData: () => NativeData, n: number, key: string): NativeData | undefined;
    toOutside(url: string): void;
    destroy(): void;
}
export declare class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> implements IRouter<P, N> {
    nativeRouter: BrowserNativeRouter;
    constructor(browserNativeRouter: BrowserNativeRouter, locationTransform: LocationTransform<P>);
}
export declare function createRouter<P extends RootParams, N extends string>(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationTransform: LocationTransform<P>): Router<P, N>;
export interface IRouter<P extends RootParams, N extends string> extends IBaseRouter<P, N> {
    nativeRouter: BrowserNativeRouter;
}
