"use strict";

exports.__esModule = true;
exports.ruleToPathname = ruleToPathname;

function ruleToPathname(rule, data) {
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