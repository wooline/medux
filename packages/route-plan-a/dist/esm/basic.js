import { config } from '@medux/core';
import { compilePath } from './matchPath';
export var routeConfig = {
  RSP: '|',
  escape: true,
  dateParse: false,
  splitKey: 'q',
  historyMax: 10,
  homeUrl: '/'
};
export function setRouteConfig(conf) {
  conf.RSP !== undefined && (routeConfig.RSP = conf.RSP);
  conf.escape !== undefined && (routeConfig.escape = conf.escape);
  conf.dateParse !== undefined && (routeConfig.dateParse = conf.dateParse);
  conf.splitKey && (routeConfig.splitKey = conf.splitKey);
  conf.historyMax && (routeConfig.historyMax = conf.historyMax);
  conf.homeUrl && (routeConfig.homeUrl = conf.homeUrl);
}
export var RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: "medux" + config.NSP + "RouteChange",
  BeforeRouteChange: "medux" + config.NSP + "BeforeRouteChange"
};
export function beforeRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState]
  };
}
export function routeChangeAction(routeState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState]
  };
}
export function routeParamsAction(moduleName, params, action) {
  return {
    type: "" + moduleName + config.NSP + RouteActionTypes.MRouteParams,
    payload: [params, action]
  };
}
export function checkLocation(location) {
  var data = {
    pathname: location.pathname || '',
    search: location.search || '',
    hash: location.hash || ''
  };
  data.pathname = ("/" + data.pathname).replace(/\/+/g, '/');

  if (data.pathname !== '/') {
    data.pathname = data.pathname.replace(/\/$/, '');
  }

  data.search = ("?" + data.search).replace('??', '?');
  data.hash = ("#" + data.hash).replace('##', '#');

  if (data.search === '?') {
    data.search = '';
  }

  if (data.hash === '#') {
    data.hash = '';
  }

  return data;
}
export function urlToLocation(url) {
  url = ("/" + url).replace(/\/+/g, '/');

  if (!url) {
    return {
      pathname: '/',
      search: '',
      hash: ''
    };
  }

  var arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  var pathname = arr[0],
      _arr$ = arr[1],
      search = _arr$ === void 0 ? '' : _arr$,
      _arr$2 = arr[2],
      hash = _arr$2 === void 0 ? '' : _arr$2;
  return {
    pathname: pathname,
    search: search && "?" + search,
    hash: hash && "#" + hash
  };
}
export function compileRule(routeRule, parentAbsoluteViewName, parentPaths, viewToPaths, viewToRule, ruleToKeys) {
  if (parentAbsoluteViewName === void 0) {
    parentAbsoluteViewName = '';
  }

  if (parentPaths === void 0) {
    parentPaths = [];
  }

  if (viewToPaths === void 0) {
    viewToPaths = {};
  }

  if (viewToRule === void 0) {
    viewToRule = {};
  }

  if (ruleToKeys === void 0) {
    ruleToKeys = {};
  }

  for (var _rule in routeRule) {
    if (routeRule.hasOwnProperty(_rule)) {
      var item = routeRule[_rule];

      var _ref = typeof item === 'string' ? [item, null] : item,
          _viewName = _ref[0],
          pathConfig = _ref[1];

      if (!ruleToKeys[_rule]) {
        var _compilePath = compilePath(_rule, {
          end: true,
          strict: false,
          sensitive: false
        }),
            keys = _compilePath.keys;

        ruleToKeys[_rule] = keys.reduce(function (prev, cur) {
          prev.push(cur.name);
          return prev;
        }, []);
      }

      var absoluteViewName = parentAbsoluteViewName + "/" + _viewName;
      viewToRule[absoluteViewName] = _rule;
      var paths = [].concat(parentPaths, [_viewName]);
      viewToPaths[_viewName] = paths;

      if (pathConfig) {
        compileRule(pathConfig, absoluteViewName, paths, viewToPaths, viewToRule, ruleToKeys);
      }
    }
  }

  return {
    viewToRule: viewToRule,
    ruleToKeys: ruleToKeys,
    viewToPaths: viewToPaths
  };
}