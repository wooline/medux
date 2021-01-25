import { CoreRootState, RootModuleFacade } from '@medux/core';
export declare const routeConfig: {
    RSP: string;
    historyMax: number;
    homeUri: string;
};
export declare function setRouteConfig(conf: {
    RSP?: string;
    historyMax?: number;
    homeUri?: string;
}): void;
export declare type HistoryAction = 'PUSH' | 'BACK' | 'POP' | 'REPLACE' | 'RELAUNCH';
export declare type ModuleParams = {
    [key: string]: any;
};
export declare type RootParams = {
    [moduleName: string]: ModuleParams;
};
export interface NativeLocation {
    pathname: string;
    search: string;
    hash: string;
}
export interface Location<P extends RootParams = RootParams> {
    tag: string;
    params: Partial<P>;
}
export declare type RouteState<P extends RootParams, NL extends NativeLocation = NativeLocation> = Location<P> & NL & {
    action: HistoryAction;
    key: string;
};
export declare type RouteRootState<P extends RootParams, NL extends NativeLocation = NativeLocation> = CoreRootState & {
    route: RouteState<P, NL>;
};
export declare type RootState<A extends RootModuleFacade, P extends RootParams, NL extends NativeLocation = NativeLocation> = {
    route: RouteState<P, NL>;
} & {
    [M in keyof A]?: A[M]['state'];
};
export declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export declare function extractNativeLocation<P extends RootParams, NL extends NativeLocation>(routeState: RouteState<P, NL>): NL;
export interface RoutePayload<P extends RootParams = RootParams> {
    tag?: string;
    params?: DeepPartial<P>;
    extendParams?: P | true;
}
export declare function uriToLocation<P extends RootParams>(uri: string): {
    key: string;
    location: Location<P>;
};
interface HistoryRecord {
    uri: string;
    tag: string;
    query: string;
    key: string;
    sub: History;
}
export declare class History {
    groupMax: number;
    actionsMax: number;
    private groups;
    private actions;
    getAction(keyOrIndex?: number | string): HistoryRecord | undefined;
    getGroup(keyOrIndex?: number | string): HistoryRecord | undefined;
    getActionIndex(key: string): number;
    getGroupIndex(key: string): number;
    getCurrentInternalHistory(): History;
    findTag(tag: string): void;
    getUriStack(): {
        actions: string[];
        groups: string[];
    };
    push(location: Location, key: string): void;
    replace(location: Location, key: string): void;
    relaunch(location: Location, key: string): void;
    pop(n: number): boolean;
    back(n: number): boolean;
}
export {};
