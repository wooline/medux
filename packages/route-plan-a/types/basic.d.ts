import { ModuleGetter, ReturnModule, RootState as CoreRootState } from '@medux/core';
export declare type HistoryAction = 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
export interface Location {
    url: string;
    pathname: string;
    search: string;
    hash: string;
    action: HistoryAction;
    key: string;
}
export declare type RouteParams = {
    [moduleName: string]: {
        [key: string]: any;
    } | undefined;
};
export interface DisplayViews {
    [moduleName: string]: {
        [viewName: string]: boolean | undefined;
    } | undefined;
}
export interface RouteData<P extends RouteParams = any> {
    views: DisplayViews;
    params: P;
    paths: string[];
    action: HistoryAction;
    key: string;
}
export declare type RouteState<P extends RouteParams = RouteParams> = Location & RouteData<P> & {
    history: string[];
    stack: string[];
};
declare type MountViews<M extends any> = {
    [key in keyof M['views']]?: boolean;
};
declare type ModuleParams<M extends any> = M['model']['initState']['routeParams'];
export declare type RouteViews<G extends ModuleGetter> = {
    [key in keyof G]?: MountViews<ReturnModule<G[key]>>;
};
export declare type RootState<G extends ModuleGetter> = {
    route: {
        history: string[];
        stack: string[];
        url: string;
        pathname: string;
        search: string;
        hash: string;
        views: {
            [key in keyof G]?: MountViews<ReturnModule<G[key]>>;
        };
        params: {
            [key in keyof G]?: ModuleParams<ReturnModule<G[key]>>;
        };
        paths: string[];
        key: string;
        action: HistoryAction;
    };
} & CoreRootState<G>;
export declare const routeConfig: {
    RSP: string;
    escape: boolean;
    dateParse: boolean;
    splitKey: string;
    historyMax: number;
    homeUrl: string;
};
export declare function setRouteConfig(conf: {
    RSP?: string;
    escape?: boolean;
    dateParse?: boolean;
    splitKey?: string;
    historyMax?: number;
    homeUrl?: string;
}): void;
export declare const RouteActionTypes: {
    MRouteParams: string;
    RouteChange: string;
    BeforeRouteChange: string;
};
export declare function beforeRouteChangeAction(routeState: RouteState): {
    type: string;
    payload: RouteState<RouteParams>[];
};
export declare function routeChangeAction(routeState: RouteState): {
    type: string;
    payload: RouteState<RouteParams>[];
};
export declare function routeParamsAction(moduleName: string, params: any, action: HistoryAction): {
    type: string;
    payload: any[];
};
export interface PaRouteData<P extends RouteParams = RouteParams> {
    views: DisplayViews;
    params: P;
    paths: string[];
}
export interface PaLocation {
    pathname: string;
    search: string;
    hash: string;
}
export interface LocationPayload {
    pathname: string;
    search?: string;
    hash?: string;
}
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export interface RoutePayload<P extends RouteParams = RouteParams> {
    paths: string[] | string;
    params?: DeepPartial<P>;
    extendParams?: DeepPartial<P>;
}
export declare function dataIsLocation(data: RoutePayload | LocationPayload): data is LocationPayload;
export declare function checkLocation(location: LocationPayload): PaLocation;
export declare function urlToLocation(url: string): PaLocation;
export declare function locationToUrl(safeLocation: PaLocation): string;
export interface RouteRule {
    [path: string]: string | [string, RouteRule];
}
export declare function compileRule(routeRule: RouteRule, parentAbsoluteViewName?: string, viewToRule?: {
    [viewName: string]: string;
}, ruleToKeys?: {
    [rule: string]: (string | number)[];
}): {
    viewToRule: {
        [viewName: string]: string;
    };
    ruleToKeys: {
        [rule: string]: (string | number)[];
    };
};
export {};
