import { CoreRootState, RootModuleFacade } from '@medux/core';
export declare const routeConfig: {
    actionMaxHistory: number;
    pagesMaxHistory: number;
    pagenames: {
        [key: string]: string;
    };
    defaultParams: any;
    disableNativeRoute: boolean;
};
export declare function setRouteConfig(conf: {
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    homeUri?: string;
    pagenames?: {
        [key: string]: string;
    };
    disableNativeRoute?: boolean;
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
    searchData?: {
        [key: string]: string;
    };
    hashData?: {
        [key: string]: string;
    };
}
export interface Location<P extends RootParams = {}> {
    pagename: string;
    params: Partial<P>;
}
export interface PayloadLocation<P extends RootParams = {}, N extends string = string> {
    pagename?: N;
    params?: DeepPartial<P>;
    extendParams?: DeepPartial<P> | 'current';
}
export interface PartialLocation<P extends RootParams = {}> {
    pagename: string;
    params: DeepPartial<P>;
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
export declare function nativeUrlToNativeLocation(url: string): NativeLocation;
export declare function nativeLocationToNativeUrl({ pathname, searchData, hashData }: NativeLocation): string;
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
