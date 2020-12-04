import { pathToRegexp } from 'path-to-regexp';
const cache = {};
export function compilePath(rule) {
  if (cache[rule]) {
    return cache[rule];
  }

  const keys = [];
  const regexp = pathToRegexp(rule.replace(/\$$/, ''), keys, {
    end: rule.endsWith('$'),
    strict: false,
    sensitive: false
  });
  const result = {
    regexp,
    keys
  };
  const cachedRules = Object.keys(cache);

  if (cachedRules.length > 1000) {
    delete cache[cachedRules[0]];
  }

  cache[rule] = result;
  return result;
}
export function parseRule(rule, pathname) {
  const {
    regexp,
    keys
  } = compilePath(rule);
  pathname = `/${pathname}/`.replace(/\/+/g, '/');
  const match = regexp.exec(pathname);
  if (!match) return null;
  const [matchedPathname, ...values] = match;
  const args = keys.reduce((memo, key, index) => {
    memo[key.name] = values[index];
    return memo;
  }, {});
  return {
    args,
    subPathname: pathname.replace(matchedPathname, '')
  };
}
export function ruleToPathname(rule, data) {
  if (/:\w/.test(rule)) {
    return {
      pathname: rule,
      params: data
    };
  }

  return {
    pathname: rule,
    params: data
  };
}
export function compileRule(rules, pathname, pathArgs) {
  Object.keys(rules).forEach(rule => {
    const result = parseRule(rule, pathname);

    if (result) {
      const {
        args,
        subPathname
      } = result;
      const config = rules[rule];
      const [callback, subRules] = Array.isArray(config) ? config : [config, undefined];
      callback(args, pathArgs);
      subRules && subPathname && compileRule(subRules, subPathname, pathArgs);
    }
  });
}