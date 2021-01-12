export declare function errorAction(reason: Object): {
    type: string;
    payload: Object[];
};
export declare function moduleInitAction(moduleName: string, initState: any): {
    type: string;
    payload: any[];
};
