export declare function isPlainObject(obj: any): boolean;
export declare function extendDefault(target: {
    [key: string]: any;
}, def: {
    [key: string]: any;
}): {
    [key: string]: any;
};
export declare function excludeDefault(data: {
    [key: string]: any;
}, def: {
    [key: string]: any;
}, keepTopLevel: boolean): {
    [key: string]: any;
};
export declare function splitPrivate(data: {
    [key: string]: any;
}, deleteTopLevel: {
    [key: string]: boolean;
}): [{
    [key: string]: any;
} | undefined, {
    [key: string]: any;
} | undefined];
