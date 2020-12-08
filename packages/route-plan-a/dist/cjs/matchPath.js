"use strict";

exports.__esModule = true;
exports.compilePath = compilePath;
exports.parseRule = parseRule;
exports.extractPathParams = extractPathParams;

var _pathToRegexp = require("path-to-regexp");

var cache = {};

function compilePath(rule) {
  if (cache[rule]) {
    return cache[rule];
  }

  var keys = [];
  var regexp = (0, _pathToRegexp.pathToRegexp)(rule.replace(/\$$/, ''), keys, {
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

function parseRule(rule, pathname) {
  var _compilePath = compilePath(rule),
      regexp = _compilePath.regexp,
      keys = _compilePath.keys;

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
    matchPathame: matchedPathname,
    subPathname: pathname.replace(matchedPathname, '')
  };
}

function extractPathParams(rules, pathname, pathParams) {
  for (var _rule in rules) {
    if (rules.hasOwnProperty(_rule)) {
      var data = parseRule(_rule, pathname);

      if (data) {
        var _args = data.args,
            matchPathame = data.matchPathame,
            subPathname = data.subPathname;

        var result = rules[_rule](_args, pathParams);

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