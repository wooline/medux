export declare function compilePath(rule: string): {
    regexp: RegExp;
    keys: any[];
};
export declare function parseRule(rule: string, pathname: string): {
    args: {
        [key: string]: any;
    };
    subPathname: string;
} | null;
export declare function ruleToPathname(rule: string, data: {
    [key: string]: any;
}): {
    pathname: string;
    params: {
        [key: string]: any;
    };
};
export declare type ParseRules<P> = (args: any, pathArgs: P) => void;
export declare type PathnameRules<P = any> = {
    [rule: string]: ParseRules<P> | [ParseRules<P>, PathnameRules<P>];
};
export declare function compileRule<P = any>(rules: PathnameRules<P>, pathname: string, pathArgs: P): void;
