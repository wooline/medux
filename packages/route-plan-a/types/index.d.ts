import { RouteData } from '@medux/core';
import assignDeep from './deep-extend';
export { locationToUrl, urlToLocation, checkUrl } from './utils';
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
export declare const deepAssign: typeof assignDeep;
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
export declare function buildTransformRoute(routeConfig: RouteConfig): TransformRoute;
