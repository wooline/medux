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
export declare type HistoryAction = 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
export declare type ModuleParams = {
    [key: string]: any;
};
export declare type RootParams = {
    [moduleName: string]: ModuleParams;
};
export interface NativeLocation {
}
export interface WebNativeLocation extends NativeLocation {
    pathname: string;
    search: string;
    hash: string;
}
export interface Location<P extends RootParams = RootParams> {
    tag: string;
    params: Partial<P>;
}
export declare type RouteState<P extends RootParams, NL extends NativeLocation> = Location<P> & NL & {
    action: HistoryAction;
    key: string;
    history: string[];
    stack: string[];
};
export declare type RouteRootState<P extends RootParams, NL extends NativeLocation> = CoreRootState & {
    route: RouteState<P, NL>;
};
export declare type RootState<A extends RootModuleFacade, P extends RootParams, NL extends NativeLocation> = {
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
export declare function locationToUri(location: Location, key: string): string;
export declare function uriToLocation<P extends RootParams>(uri: string): {
    key: string;
    location: Location<P>;
};
export declare function buildHistoryStack(location: Location, action: HistoryAction, key: string, curData: {
    history: string[];
    stack: string[];
}): {
    history: string[];
    stack: string[];
};
