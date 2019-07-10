import { RouteState } from './basic';
export declare const ActionTypes: {
    M_LOADING: string;
    M_INIT: string;
    F_ERROR: string;
    F_ROUTE_CHANGE: string;
    F_ROUTE_COMPLETE: string;
};
export declare function errorAction(error: any): {
    type: string;
    payload: any;
};
export declare function routeChangeAction(route: RouteState): {
    type: string;
    payload: RouteState<any>;
};
export declare function routeCompleteAction(): {
    type: string;
};
