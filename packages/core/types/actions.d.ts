import { RouteState } from './basic';
export declare function errorAction(error: any): {
    type: string;
    payload: any[];
};
export declare function routeChangeAction(route: RouteState): {
    type: string;
    payload: RouteState<any>[];
};
export declare function routeParamsAction(moduleName: string, params: any, action?: string): {
    type: string;
    payload: any[];
};
