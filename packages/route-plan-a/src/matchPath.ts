import {pathToRegexp} from 'path-to-regexp';

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

export function parseRule(rule: string, pathname: string): {args: {[key: string]: any}; subPathname: string} | null {
  const {regexp, keys} = compilePath(rule);
  pathname = `/${pathname}/`.replace(/\/+/g, '/');
  const match = regexp.exec(pathname);
  if (!match) return null;
  const [matchedPathname, ...values] = match;
  const args = keys.reduce((memo: {[key: string]: any}, key: {name: string | number}, index: number) => {
    memo[key.name] = values[index];
    return memo;
  }, {});
  return {args, subPathname: pathname.replace(matchedPathname, '')};
}
export function ruleToPathname(rule: string, data: {[key: string]: any}): {pathname: string; params: {[key: string]: any}} {
  if (/:\w/.test(rule)) {
    return {pathname: rule, params: data};
  }
  return {pathname: rule, params: data};
}
export type ParseRules<P> = (args: any, pathArgs: P) => void;
export type PathnameRules<P = any> = {[rule: string]: ParseRules<P> | [ParseRules<P>, PathnameRules<P>]};

export function compileRule<P = any>(rules: PathnameRules<P>, pathname: string, pathArgs: P) {
  Object.keys(rules).forEach((rule) => {
    const result = parseRule(rule, pathname);
    if (result) {
      const {args, subPathname} = result;
      const config = rules[rule];
      const [callback, subRules] = Array.isArray(config) ? config : [config, undefined];
      callback(args, pathArgs);
      subRules && subPathname && compileRule(subRules, subPathname, pathArgs);
    }
  });
}
