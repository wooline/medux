import { CurrentViews } from './global';
export declare const ActionTypes: {
    M_LOADING: string;
    M_INIT: string;
    F_ERROR: string;
    F_VIEW_INVALID: string;
};
export declare function errorAction(error: any): {
    type: string;
    error: any;
};
export declare function viewInvalidAction(currentViews: CurrentViews): {
    type: string;
    currentViews: CurrentViews;
};
//# sourceMappingURL=actions.d.ts.map