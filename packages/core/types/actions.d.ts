import { RouteState } from './basic';
export declare function errorAction(error: any): {
    type: string;
    payload: any[];
};
export declare function routeChangeAction(routeState: RouteState): {
    type: string;
    payload: RouteState<import("./basic").Location, import("./basic").RouteParams>[];
};
export declare function routeParamsAction(moduleName: string, params: any, action?: string): {
    type: string;
    payload: any[];
};
