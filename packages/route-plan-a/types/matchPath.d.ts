import { Key, PathFunction } from './path-to-regexp.js';
export declare function compileToPath(rule: string): PathFunction;
export declare function compilePath(path: string, options?: {
    end: boolean;
    strict: boolean;
    sensitive: boolean;
}): {
    regexp: RegExp;
    keys: Key[];
};
interface MatchResult {
    params: {
        [key: string]: string;
    };
    isExact: boolean;
    path: string;
    url: string;
}
interface MatchPathOptions {
    path?: string | string[];
    strict?: boolean;
    exact?: boolean;
    sensitive?: boolean;
}
export declare function matchPath(pathname: string, options?: string | string[] | MatchPathOptions): MatchResult;
export default matchPath;
