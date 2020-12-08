import { RootParams, DeepPartial } from './basic';
export declare function compilePath(rule: string): {
    regexp: RegExp;
    keys: any[];
};
export declare function parseRule(rule: string, pathname: string): {
    args: {
        [key: string]: any;
    };
    matchPathame: string;
    subPathname: string;
} | null;
export declare type ParseRules<P extends RootParams> = (args: any, pathParams: DeepPartial<P>) => PathnameRules<P> | string | void;
export declare type PathnameRules<P extends RootParams> = {
    [rule: string]: ParseRules<P>;
};
export declare function extractPathParams<P extends RootParams>(rules: PathnameRules<P>, pathname: string, pathParams: DeepPartial<P>): string;
