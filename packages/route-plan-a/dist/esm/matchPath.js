import { pathToRegexp } from 'path-to-regexp';
var cache = {};
export function compilePath(rule) {
  if (cache[rule]) {
    return cache[rule];
  }

  var keys = [];
  var regexp = pathToRegexp(rule.replace(/\$$/, ''), keys, {
    end: rule.endsWith('$'),
    strict: false,
    sensitive: false
  });
  var result = {
    regexp: regexp,
    keys: keys
  };
  var cachedRules = Object.keys(cache);

  if (cachedRules.length > 1000) {
    delete cache[cachedRules[0]];
  }

  cache[rule] = result;
  return result;
}
export function parseRule(rule, pathname) {
  var _compilePath = compilePath(rule),
      regexp = _compilePath.regexp,
      keys = _compilePath.keys;

  pathname = ("/" + pathname + "/").replace(/\/+/g, '/');
  var match = regexp.exec(pathname);
  if (!match) return null;
  var matchedPathname = match[0],
      values = match.slice(1);
  var args = keys.reduce(function (memo, key, index) {
    memo[key.name] = values[index];
    return memo;
  }, {});
  return {
    args: args,
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
  Object.keys(rules).forEach(function (rule) {
    var result = parseRule(rule, pathname);

    if (result) {
      var _args = result.args,
          subPathname = result.subPathname;
      var config = rules[rule];

      var _ref = Array.isArray(config) ? config : [config, undefined],
          callback = _ref[0],
          subRules = _ref[1];

      callback(_args, pathArgs);
      subRules && subPathname && compileRule(subRules, subPathname, pathArgs);
    }
  });
}