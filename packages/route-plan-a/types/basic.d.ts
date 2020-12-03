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
export declare type Params = {
    [moduleName: string]: {
        [key: string]: any;
    } | undefined;
};
export interface NativeLocation {
    pathname: string;
    search: string;
    hash: string;
}
export interface Location<P extends Params = Params> {
    tag: string;
    params: P;
}
export declare type RouteState<P extends Params = Params> = Location<P> & {
    pathname: string;
    search: string;
    hash: string;
    action: HistoryAction;
    key: string;
    history: string[];
    stack: string[];
};
export declare type RouteRootState<P extends Params = Params> = CoreRootState & {
    route: RouteState<P>;
};
export declare type RootState<A extends RootModuleFacade, P extends Params> = {
    route: RouteState<P>;
} & {
    [M in keyof A]?: A[M]['state'];
};
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export interface RoutePayload<P extends Params = Params> {
    tag?: string;
    params?: DeepPartial<P>;
    extendParams?: P | true;
}
export declare function locationToUri(location: Location, key: string): string;
export declare function uriToLocation<P extends Params = Params>(uri: string): {
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
export {};
