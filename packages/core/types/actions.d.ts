import { DisplayViews } from './basic';
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
export declare function viewInvalidAction(currentViews: DisplayViews): {
    type: string;
    currentViews: DisplayViews;
};
