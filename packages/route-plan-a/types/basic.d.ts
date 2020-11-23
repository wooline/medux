import { RootModuleFacade } from '@medux/core';
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
export declare type RouteState<P extends RouteParams = RouteParams> = Location & {
    paths: string[];
    views: DisplayViews;
    params: P;
    history: string[];
    stack: string[];
};
export declare type RootState<A extends RootModuleFacade> = {
    route: {
        history: string[];
        stack: string[];
        url: string;
        pathname: string;
        search: string;
        hash: string;
        views: {
            [M in keyof A]?: A[M]['viewMounted'];
        };
        params: {
            [M in keyof A]?: A[M]['state']['routeParams'];
        };
        paths: string[];
        key: string;
        action: HistoryAction;
    };
} & {
    [M in keyof A]?: A[M]['state'];
};
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
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export interface RoutePayload<P extends RouteParams = RouteParams> {
    pathname?: string;
    search?: string;
    hash?: string;
    paths?: string[];
    params?: DeepPartial<P>;
    extendParams?: DeepPartial<P> | true;
}
export declare function checkLocation(location: RoutePayload): PaLocation;
export declare function urlToLocation(url: string): PaLocation;
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
