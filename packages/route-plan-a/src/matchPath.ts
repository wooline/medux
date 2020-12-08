import {pathToRegexp} from 'path-to-regexp';
import {RootParams, DeepPartial} from './basic';

const cache: {[rule: string]: {regexp: RegExp; keys: any[]}} = {};

export function compilePath(rule: string): {regexp: RegExp; keys: any[]} {
  if (cache[rule]) {
    return cache[rule];
  }
  const keys: any[] = [];
  const regexp = pathToRegexp(rule.replace(/\$$/, ''), keys, {end: rule.endsWith('$'), strict: false, sensitive: false});
  const result = {regexp, keys};
  const cachedRules = Object.keys(cache);
  if (cachedRules.length > 1000) {
    delete cache[cachedRules[0]];
  }
  cache[rule] = result;
  return result;
}

export function parseRule(rule: string, pathname: string): {args: {[key: string]: any}; matchPathame: string; subPathname: string} | null {
  const {regexp, keys} = compilePath(rule);
  const match = regexp.exec(pathname);
  if (!match) return null;
  const [matchedPathname, ...values] = match;
  const args = keys.reduce((memo: {[key: string]: any}, key: {name: string | number}, index: number) => {
    memo[key.name] = values[index];
    return memo;
  }, {});
  return {args, matchPathame: matchedPathname, subPathname: pathname.replace(matchedPathname, '')};
}

export type ParseRules<P extends RootParams> = (args: any, pathParams: DeepPartial<P>) => PathnameRules<P> | string | void;
export type PathnameRules<P extends RootParams> = {[rule: string]: ParseRules<P>};

// export function extractPathParams2<P extends RootParams>(rules: PathnameRules<P>, pathname: string, pathParams: DeepPartial<P>): string {
//   for (const rule in rules) {
//     if (rules.hasOwnProperty(rule)) {
//       const result = parseRule(rule, pathname);
//       if (result) {
//         const {args, matchPathame, subPathname} = result;
//         const config = rules[rule];
//         const [callback, subRules] = Array.isArray(config) ? config : [config, undefined];
//         const redirect = callback(args, pathParams);
//         if (redirect) {
//           pathname = redirect;
//         } else {
//           if (subRules && subPathname) {
//             pathname = matchPathame + extractPathParams(subRules, subPathname, pathParams);
//           }
//           return pathname;
//         }
//       }
//     }
//   }
//   return pathname;
// }

export function extractPathParams<P extends RootParams>(rules: PathnameRules<P>, pathname: string, pathParams: DeepPartial<P>): string {
  for (const rule in rules) {
    if (rules.hasOwnProperty(rule)) {
      const data = parseRule(rule, pathname);
      if (data) {
        const {args, matchPathame, subPathname} = data;
        const result = rules[rule](args, pathParams);
        if (typeof result === 'string') {
          pathname = result;
        } else if (result && subPathname) {
          return matchPathame + extractPathParams(result, subPathname, pathParams);
        } else {
          return pathname;
        }
      }
    }
  }
  return pathname;
}
