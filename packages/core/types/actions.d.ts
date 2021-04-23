export declare function errorAction(error: Object): {
    type: string;
    payload: Object[];
};
export declare function moduleInitAction(moduleName: string, initState: any): {
    type: string;
    payload: any[];
};
export declare function moduleReInitAction(moduleName: string, initState: any): {
    type: string;
    payload: any[];
};
