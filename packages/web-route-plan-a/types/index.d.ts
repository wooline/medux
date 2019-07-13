import { RouteData } from '@medux/core/types/export';
import { HistoryActions, TransformRoute } from '@medux/web';
import { Middleware } from 'redux';
export declare const mergeDefaultParamsMiddleware: Middleware;
export interface RouteConfig {
    [path: string]: string | [string, RouteConfig];
}
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
declare type Params = RouteData['params'];
export interface RoutePayload<P extends Params = Params> {
    params: DeepPartial<P>;
    paths: string[];
}
export declare function fillRouteData(routePayload: RoutePayload): RouteData;
export declare function getHistory<T extends Params>(getHistoryActions: () => HistoryActions<RouteData>): HistoryActions<RoutePayload<T>>;
export declare function buildTransformRoute(routeConfig: RouteConfig): TransformRoute;
export {};
