export interface ParseOptions {
    delimiter?: string;
    prefixes?: string;
}
export declare function parse(str: string, options?: ParseOptions): Token[];
export interface TokensToFunctionOptions {
    sensitive?: boolean;
    encode?: (value: string, token: Key) => string;
    validate?: boolean;
}
export declare function compile<P extends object = object>(str: string, options?: ParseOptions & TokensToFunctionOptions): PathFunction<P>;
export declare type PathFunction<P extends object = object> = (data?: P) => string;
export declare function tokensToFunction<P extends object = object>(tokens: Token[], options?: TokensToFunctionOptions): PathFunction<P>;
export interface RegexpToFunctionOptions {
    decode?: (value: string, token: Key) => string;
}
export interface MatchResult<P extends object = object> {
    path: string;
    index: number;
    params: P;
}
export declare type Match<P extends object = object> = false | MatchResult<P>;
export declare type MatchFunction<P extends object = object> = (path: string) => Match<P>;
export declare function match<P extends object = object>(str: Path, options?: ParseOptions & TokensToRegexpOptions & RegexpToFunctionOptions): MatchFunction<P>;
export declare function regexpToFunction<P extends object = object>(re: RegExp, keys: Key[], options?: RegexpToFunctionOptions): MatchFunction<P>;
export interface Key {
    name: string | number;
    prefix: string;
    suffix: string;
    pattern: string;
    modifier: string;
}
export declare type Token = string | Key;
export interface TokensToRegexpOptions {
    sensitive?: boolean;
    strict?: boolean;
    end?: boolean;
    start?: boolean;
    delimiter?: string;
    endsWith?: string;
    encode?: (value: string) => string;
}
export declare function tokensToRegexp(tokens: Token[], keys?: Key[], options?: TokensToRegexpOptions): RegExp;
export declare type Path = string | RegExp | Array<string | RegExp>;
export declare function pathToRegexp(path: Path, keys?: Key[], options?: TokensToRegexpOptions & ParseOptions): RegExp;
