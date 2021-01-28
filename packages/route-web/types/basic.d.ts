import { CoreRootState, RootModuleFacade } from '@medux/core';
export declare const routeConfig: {
    RSP: string;
    actionMaxHistory: number;
    pagesMaxHistory: number;
    pagenames: {
        [key: string]: string;
    };
};
export declare function setRouteConfig(conf: {
    RSP?: string;
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    homeUri?: string;
    pagenames?: {
        [key: string]: string;
    };
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
export interface Location<P extends RootParams = {}> {
    pagename: string;
    params: Partial<P>;
}
export declare type RouteState<P extends RootParams = {}> = Location<P> & {
    action: HistoryAction;
    key: string;
};
export declare type RouteRootState<P extends {
    [key: string]: any;
}> = CoreRootState & {
    route: RouteState<P>;
};
export declare type RootState<A extends RootModuleFacade, P extends {
    [key: string]: any;
}> = {
    route: RouteState<P>;
} & {
    [M in keyof A]?: A[M]['state'];
};
export declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export interface RoutePayload<P extends RootParams = RootParams, N extends string = string> {
    pagename?: N;
    params?: DeepPartial<P>;
    extendParams?: Partial<P> | true;
}
export declare function uriToLocation<P extends {
    [key: string]: any;
}>(uri: string): {
    key: string;
    location: Location<P>;
};
interface HistoryRecord {
    uri: string;
    pagename: string;
    query: string;
    key: string;
    sub: History;
}
export declare class History {
    private pages;
    private actions;
    getActionRecord(keyOrIndex?: number | string): HistoryRecord | undefined;
    getPageRecord(keyOrIndex?: number | string): HistoryRecord | undefined;
    getActionIndex(key: string): number;
    getPageIndex(key: string): number;
    getCurrentInternalHistory(): History;
    getUriStack(): {
        actions: string[];
        pages: string[];
    };
    push(location: Location, key: string): void;
    replace(location: Location, key: string): void;
    relaunch(location: Location, key: string): void;
    pop(n: number): boolean;
    back(n: number): boolean;
}
export {};
