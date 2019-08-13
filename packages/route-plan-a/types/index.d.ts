import { RouteData } from '@medux/core/types/export';
export declare function setConfig(conf: {
    escape?: boolean;
    dateParse?: boolean;
    splitKey?: string;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
}): void;
export interface Location {
    pathname: string;
    search: string;
    hash: string;
}
export declare type RouteToLocation = (routeData: RouteData) => Location;
export declare type LocationToRoute = (location: Location) => RouteData;
export interface TransformRoute {
    locationToRoute: LocationToRoute;
    routeToLocation: RouteToLocation;
}
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
export declare function fillRouteData<R>(routePayload: RoutePayload<R>): RouteData;
export declare function buildTransformRoute(routeConfig: RouteConfig): TransformRoute;
export {};
