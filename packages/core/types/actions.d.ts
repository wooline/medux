import { RouteState } from './basic';
export declare const ActionTypes: {
    MLoading: string;
    MInit: string;
    MPreRouteParams: string;
    Error: string;
    RouteChange: string;
};
export declare function errorAction(error: any): {
    type: string;
    payload: any[];
};
export declare function routeChangeAction(route: RouteState): {
    type: string;
    payload: RouteState<any>[];
};
export declare function preRouteParamsAction(moduleName: string, params: any): {
    type: string;
    payload: any[];
};
