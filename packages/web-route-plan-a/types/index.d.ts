import { TransformRoute } from '@medux/web';
import { Middleware } from 'redux';
export interface RouteConfig {
    [path: string]: string | [string, RouteConfig];
}
export declare function buildLocationToRoute(routeConfig: RouteConfig): TransformRoute;
export declare const mergeDefaultParamsMiddleware: Middleware;
