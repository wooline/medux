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
  const match = regexp.exec(pathname);
  if (!match) return null;
  const [matchedPathname, ...values] = match;
  const args = keys.reduce((memo, key, index) => {
    memo[key.name] = values[index];
    return memo;
  }, {});
  return {
    args,
    matchPathame: matchedPathname,
    subPathname: pathname.replace(matchedPathname, '')
  };
}
export function extractPathParams(rules, pathname, pathParams) {
  for (const rule in rules) {
    if (rules.hasOwnProperty(rule)) {
      const data = parseRule(rule, pathname);

      if (data) {
        const {
          args,
          matchPathame,
          subPathname
        } = data;
        const result = rules[rule](args, pathParams);

        if (typeof result === 'string') {
          pathname = result;
        } else if (result) {
          return matchPathame + extractPathParams(result, subPathname, pathParams);
        } else {
          return pathname;
        }
      }
    }
  }

  return pathname;
}