import { RouteData } from '@medux/core';
export interface MeduxLocation {
    pathname: string;
    search: string;
    hash: string;
}
export declare type RouteToLocation = (routeData: RouteData) => MeduxLocation;
export declare type LocationToRoute = (location: MeduxLocation) => RouteData;
export interface TransformRoute {
    locationToRoute: LocationToRoute;
    routeToLocation: RouteToLocation;
}
export declare const deepAssign: any;
export declare function setRouteConfig(conf: {
    escape?: boolean;
    dateParse?: boolean;
    splitKey?: string;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
}): void;
export interface RouteConfig {
    [path: string]: string | [string, RouteConfig];
}
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export interface RoutePayload<P> {
    extend?: RouteData;
    stackParams?: DeepPartial<P>[];
    paths?: string[];
}
export declare function assignRouteData(paths: string[], stackParams: {
    [moduleName: string]: any;
}[], args?: {
    [moduleName: string]: any;
}): RouteData;
export declare function fillRouteData<R>(routePayload: RoutePayload<R>): RouteData;
declare type PathNameMap = (pathname: string) => string;
export declare type PathnameMap = {
    in: PathNameMap;
    out: PathNameMap;
};
export declare function buildTransformRoute(routeConfig: RouteConfig, pathnameMap?: PathnameMap): TransformRoute;
export {};
