import { TransformRoute } from '@medux/web';
export interface RouteConfig {
    [path: string]: string | [string, RouteConfig];
}
export declare function buildLocationToRoute(routeConfig: RouteConfig): TransformRoute;
