import { History } from './basic';
import type { LocationTransform } from './transform';
import type { RootParams, Location, NativeLocation, RouteState, PayloadLocation, PartialLocation } from './basic';
export { setRouteConfig, routeConfig, nativeUrlToNativeLocation } from './basic';
export { PagenameMap, createLocationTransform } from './transform';
export { routeMiddleware, createRouteModule, RouteActionTypes, ModuleWithRouteHandlers } from './module';
export type { RouteModule } from './module';
export type { LocationTransform } from './transform';
export type { RootParams, Location, NativeLocation, RouteState, HistoryAction, DeepPartial, PayloadLocation } from './basic';
interface Store {
    dispatch(action: {
        type: string;
    }): any;
}
export declare type NativeData = {
    nativeLocation: NativeLocation;
    nativeUrl: string;
};
interface RouterTask {
    method: string;
}
interface NativeRouterTask {
    resolve: (nativeData: NativeData | undefined) => void;
    reject: () => void;
    nativeData: undefined | NativeData;
}
export declare abstract class BaseNativeRouter {
    protected curTask?: NativeRouterTask;
    protected taskList: RouterTask[];
    protected router: BaseRouter<any, string>;
    protected abstract push(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;
    protected abstract replace(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;
    protected abstract relaunch(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;
    protected abstract back(getNativeData: () => NativeData, n: number, key: string): void | NativeData | Promise<NativeData>;
    abstract toOutside(url: string): void;
    abstract destroy(): void;
    protected onChange(key: string): boolean;
    setRouter(router: BaseRouter<any, string>): void;
    execute(method: 'relaunch' | 'push' | 'replace' | 'back', getNativeData: () => NativeData, ...args: any[]): Promise<NativeData | undefined>;
}
export declare abstract class BaseRouter<P extends RootParams, N extends string> implements IBaseRouter<P, N> {
    nativeRouter: BaseNativeRouter;
    protected locationTransform: LocationTransform<P>;
    private _tid;
    private curTask?;
    private taskList;
    private _nativeData;
    private routeState;
    private meduxUrl;
    protected store: Store | undefined;
    readonly history: History;
    private _lid;
    protected readonly listenerMap: {
        [id: string]: (data: RouteState<P>) => void | Promise<void>;
    };
    constructor(nativeLocationOrNativeUrl: NativeLocation | string, nativeRouter: BaseNativeRouter, locationTransform: LocationTransform<P>);
    addListener(callback: (data: RouteState<P>) => void | Promise<void>): () => void;
    protected dispatch(data: RouteState<P>): Promise<void[]>;
    getRouteState(): RouteState<P>;
    getPagename(): string;
    getParams(): Partial<P>;
    getMeduxUrl(): string;
    getNativeLocation(): NativeLocation;
    getNativeUrl(): string;
    setStore(_store: Store): void;
    getCurKey(): string;
    findHistoryIndexByKey(key: string): number;
    private _createKey;
    nativeUrlToNativeLocation(url: string): NativeLocation;
    nativeLocationToLocation(nativeLocation: NativeLocation): Location<P>;
    nativeUrlToLocation(nativeUrl: string): Location<P>;
    urlToLocation(url: string): Location<P>;
    nativeLocationToNativeUrl(nativeLocation: NativeLocation): string;
    locationToNativeUrl(location: PartialLocation<P>): string;
    locationToMeduxUrl(location: PartialLocation<P>): string;
    payloadToPartial(payload: PayloadLocation<P, N>): PartialLocation<P>;
    relaunch(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
    private _relaunch;
    push(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
    private _push;
    replace(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
    private _replace;
    back(n?: number, indexUrl?: string, internal?: boolean, disableNative?: boolean): void;
    private _back;
    private taskComplete;
    private executeTask;
    private addTask;
    destroy(): void;
}
export interface IBaseRouter<P extends RootParams, N extends string> {
    history: History;
    nativeRouter: BaseNativeRouter;
    addListener(callback: (data: RouteState<P>) => void | Promise<void>): void;
    getRouteState(): RouteState<P>;
    getPagename(): string;
    getParams(): Partial<P>;
    getMeduxUrl(): string;
    getNativeLocation(): NativeLocation;
    getNativeUrl(): string;
    setStore(_store: Store): void;
    getCurKey(): string;
    findHistoryIndexByKey(key: string): number;
    nativeUrlToNativeLocation(url: string): NativeLocation;
    nativeLocationToLocation(nativeLocation: NativeLocation): Location<P>;
    nativeUrlToLocation(nativeUrl: string): Location<P>;
    nativeLocationToNativeUrl(nativeLocation: NativeLocation): string;
    urlToLocation(url: string): Location<P>;
    locationToNativeUrl(location: PartialLocation<P>): string;
    locationToMeduxUrl(location: PartialLocation<P>): string;
    payloadToPartial(payload: PayloadLocation<P, N>): PartialLocation<P>;
    relaunch(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
    push(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
    replace(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
    back(n?: number, indexUrl?: string, internal?: boolean, disableNative?: boolean): void;
    destroy(): void;
}
