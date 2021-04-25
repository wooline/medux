export declare const routeConfig: {
    actionMaxHistory: number;
    pagesMaxHistory: number;
    pagenames: {
        [key: string]: string;
    };
    defaultParams: any;
    disableNativeRoute: boolean;
    indexUrl: string;
};
export declare function setRouteConfig(conf: {
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    indexUrl?: string;
    pagenames?: {
        [key: string]: string;
    };
    disableNativeRoute?: boolean;
}): void;
export declare type HistoryAction = 'PUSH' | 'BACK' | 'REPLACE' | 'RELAUNCH';
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
export declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export declare function nativeUrlToNativeLocation(url: string): NativeLocation;
export declare function nativeLocationToNativeUrl({ pathname, searchData, hashData }: NativeLocation): string;
export declare function locationToUri(location: Location, key: string): {
    uri: string;
    pagename: string;
    query: string;
    key: string;
};
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
    sub?: History;
}
export declare class History {
    private parent?;
    private curRecord;
    private pages;
    private actions;
    constructor(data: HistoryRecord | {
        location: Location;
        key: string;
    }, parent?: History | undefined);
    getLength(): number;
    getRecord(keyOrIndex: number | string): HistoryRecord | undefined;
    findIndex(key: string): number;
    getCurrentInternalHistory(): History | undefined;
    getStack(): HistoryRecord[];
    getUriStack(): string[];
    getPageStack(): HistoryRecord[];
    push(location: Location, key: string): void;
    replace(location: Location, key: string): void;
    relaunch(location: Location, key: string): void;
    back(delta: number): boolean;
}
export {};
