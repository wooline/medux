import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.to-string";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.search";
import "core-js/modules/es.string.split";
import "core-js/modules/es.string.starts-with";
import "core-js/modules/web.dom-collections.for-each";
import "core-js/modules/web.dom-collections.iterator";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import { ActionTypes, defaultRouteParams, getActionData } from '@medux/core';
import { compilePath, compileToPath, matchPath } from './matchPath';
import assignDeep from 'deep-extend'; // 排除默认路由参数，路由中如果参数值与默认参数相同可省去

function excludeDefaultData(data, def) {
  var result = {};
  Object.keys(data).forEach(function (key) {
    var value = data[key];
    var defaultValue = def[key];

    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && typeof value === 'object' && !Array.isArray(value)) {
        value = excludeDefaultData(value, defaultValue);
      }

      if (value !== undefined) {
        result[key] = value;
      }
    }
  });

  if (Object.keys(result).length === 0) {
    return undefined;
  }

  return result;
} // 合并默认路由参数，如果路由中某参数没传，将用默认值替代，与上面方法互逆


function mergeDefaultData(views, data, def) {
  var newData = _objectSpread({}, data);

  Object.keys(views).forEach(function (moduleName) {
    if (!newData[moduleName] && def[moduleName]) {
      newData[moduleName] = {};
    }
  });
  Object.keys(newData).forEach(function (moduleName) {
    if (def[moduleName]) {
      newData[moduleName] = assignDeep({}, def[moduleName], newData[moduleName]);
    }
  });
  return newData;
}

export var mergeDefaultParamsMiddleware = function mergeDefaultParamsMiddleware() {
  return function (next) {
    return function (action) {
      if (action.type === ActionTypes.F_ROUTE_CHANGE) {
        var payload = getActionData(action);
        var params = mergeDefaultData(payload.data.views, payload.data.params, defaultRouteParams);
        action = _objectSpread({}, action, {
          payload: _objectSpread({}, payload, {
            data: _objectSpread({}, payload.data, {
              params: params
            })
          })
        });
      }

      return next(action);
    };
  };
};

function getSearch(searchOrHash, key) {
  if (searchOrHash.length < 4) {
    return '';
  }

  var reg = new RegExp("[&?]" + key + "=");
  var str = ('#' + searchOrHash).split(reg)[1];

  if (!str) {
    return '';
  }

  return str.split('&')[0];
}

var ISO_DATE_FORMAT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;
/*
  将字符串变成 Data，因为 JSON 中没有 Date 类型，所以用正则表达式匹配自动转换
*/

function searchParse(search, key) {
  if (key === void 0) {
    key = 'q';
  }

  search = getSearch(search, key);

  if (!search) {
    return undefined;
  }

  return JSON.parse(unescape(search), function (prop, value) {
    if (typeof value === 'string' && ISO_DATE_FORMAT.test(value)) {
      return new Date(value);
    }

    return value;
  });
}

function searchStringify(searchData, key) {
  if (key === void 0) {
    key = 'q';
  }

  if (!searchData) {
    return '';
  }

  var str = JSON.stringify(searchData);

  if (!str || str === '{}') {
    return '';
  }

  return key + "=" + escape(str);
}

function pathnameParse(pathname, routeConfig, paths, args) {
  for (var _rule in routeConfig) {
    if (routeConfig.hasOwnProperty(_rule)) {
      var item = routeConfig[_rule];

      var _ref = typeof item === 'string' ? [item, null] : item,
          _viewName = _ref[0],
          pathConfig = _ref[1];

      var match = matchPath(pathname, {
        path: _rule,
        exact: !pathConfig
      }); // const match = matchPath(pathname, {path: rule.replace(/\$$/, ''), exact: rule.endsWith('$')});

      if (match) {
        paths.push(_viewName);

        var _moduleName = _viewName.split('.')[0];

        var params = match.params;

        if (params && Object.keys(params).length > 0) {
          args[_moduleName] = _objectSpread({}, args[_moduleName], params);
        }

        if (pathConfig) {
          pathnameParse(pathname, pathConfig, paths, args);
        }

        return;
      }
    }
  }
}

function compileConfig(routeConfig, parentAbsoluteViewName, viewToRule, ruleToKeys) {
  if (parentAbsoluteViewName === void 0) {
    parentAbsoluteViewName = '';
  }

  if (viewToRule === void 0) {
    viewToRule = {};
  }

  if (ruleToKeys === void 0) {
    ruleToKeys = {};
  }

  // ruleToKeys将每条rule中的params key解析出来
  for (var _rule2 in routeConfig) {
    if (routeConfig.hasOwnProperty(_rule2)) {
      if (!ruleToKeys[_rule2]) {
        var _compilePath = compilePath(_rule2, {
          end: true,
          strict: false,
          sensitive: false
        }),
            keys = _compilePath.keys;

        ruleToKeys[_rule2] = keys.reduce(function (prev, cur) {
          prev.push(cur.name);
          return prev;
        }, []);
      }

      var item = routeConfig[_rule2];

      var _ref2 = typeof item === 'string' ? [item, null] : item,
          _viewName2 = _ref2[0],
          pathConfig = _ref2[1];

      var absoluteViewName = parentAbsoluteViewName + '/' + _viewName2;
      viewToRule[absoluteViewName] = _rule2;

      if (pathConfig) {
        compileConfig(pathConfig, absoluteViewName, viewToRule, ruleToKeys);
      }
    }
  }

  return {
    viewToRule: viewToRule,
    ruleToKeys: ruleToKeys
  };
}

export function fillRouteData(routePayload) {
  var paths = routePayload.paths;
  var views = routePayload.paths.reduce(function (prev, cur) {
    var _cur$split = cur.split('.'),
        moduleName = _cur$split[0],
        viewName = _cur$split[1];

    if (viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }

      prev[moduleName][viewName] = true;
    }

    return prev;
  }, {});
  var params = mergeDefaultData(views, routePayload.params, defaultRouteParams);
  return {
    views: views,
    paths: paths,
    params: params
  };
}
export function getRouteActions(getHistoryActions) {
  return {
    push: function push(data) {
      var args = data;

      if (typeof data !== 'string' && !data['pathname']) {
        args = fillRouteData(data);
      }

      getHistoryActions().push(args);
    },
    replace: function replace(data) {
      var args = data;

      if (typeof data !== 'string' && !data['pathname']) {
        args = fillRouteData(data);
      }

      getHistoryActions().replace(args);
    },
    go: function go(n) {
      getHistoryActions().go(n);
    },
    goBack: function goBack() {
      getHistoryActions().goBack();
    },
    goForward: function goForward() {
      getHistoryActions().goForward();
    }
  };
}
export function buildTransformRoute(routeConfig) {
  var _compileConfig = compileConfig(routeConfig),
      viewToRule = _compileConfig.viewToRule,
      ruleToKeys = _compileConfig.ruleToKeys;

  var locationToRoute = function locationToRoute(location) {
    var paths = [];
    var params = searchParse(location.search) || {};
    pathnameParse(location.pathname, routeConfig, paths, params);
    var views = paths.reduce(function (prev, cur) {
      var _cur$split2 = cur.split('.'),
          moduleName = _cur$split2[0],
          viewName = _cur$split2[1];

      if (viewName) {
        if (!prev[moduleName]) {
          prev[moduleName] = {};
        }

        prev[moduleName][viewName] = true;
      }

      return prev;
    }, {});
    var hashParams = searchParse(location.hash) || {};

    var _loop = function _loop(_moduleName2) {
      if (hashParams.hasOwnProperty(_moduleName2)) {
        var moduleParams = hashParams[_moduleName2];
        Object.keys(moduleParams).forEach(function (key) {
          params[_moduleName2][key] = moduleParams[key];
        });
      }
    };

    for (var _moduleName2 in hashParams) {
      _loop(_moduleName2);
    }

    return {
      paths: paths,
      params: params,
      views: views
    };
  };

  var routeToLocation = function routeToLocation(routeData) {
    var paths = routeData.paths,
        params = routeData.params;
    var pathname = '';
    var args;

    if (paths.length > 0) {
      args = {}; // 将args二层克隆params，因为后面可能会删除path中使用到的变量

      for (var _moduleName3 in params) {
        if (params[_moduleName3] && params.hasOwnProperty(_moduleName3)) {
          args[_moduleName3] = _objectSpread({}, params[_moduleName3]);
        }
      }

      paths.reduce(function (parentAbsoluteViewName, viewName, index) {
        var absoluteViewName = parentAbsoluteViewName + '/' + viewName;
        var rule = viewToRule[absoluteViewName];
        var moduleName = viewName.split('.')[0]; //最深的一个view可以决定pathname

        if (index === paths.length - 1) {
          // const toPath = compileToPath(rule.replace(/\$$/, ''));
          var toPath = compileToPath(rule);
          pathname = toPath(params[moduleName]);
        } //pathname中传递的值可以不在params中重复传递


        var keys = ruleToKeys[rule] || [];
        keys.forEach(function (key) {
          if (args[moduleName]) {
            delete args[moduleName][key];
          }
        });
        return absoluteViewName;
      }, '');
    } else {
      args = params;
    } //将带_前缀的变量放到hashData中


    var searchData = {};
    var hashData = {};

    var _loop2 = function _loop2(_moduleName4) {
      if (args[_moduleName4] && args.hasOwnProperty(_moduleName4)) {
        var data = args[_moduleName4];
        var keys = Object.keys(data);

        if (keys.length > 0) {
          keys.forEach(function (key) {
            if (key.startsWith('_')) {
              if (!hashData[_moduleName4]) {
                hashData[_moduleName4] = {};
              }

              hashData[_moduleName4][key] = data[key];
            } else {
              if (!searchData[_moduleName4]) {
                searchData[_moduleName4] = {};
              }

              searchData[_moduleName4][key] = data[key];
            }
          });
        }
      }
    };

    for (var _moduleName4 in args) {
      _loop2(_moduleName4);
    }

    return {
      pathname: pathname,
      search: searchStringify(excludeDefaultData(searchData, defaultRouteParams)),
      hash: searchStringify(excludeDefaultData(hashData, defaultRouteParams))
    };
  };

  return {
    locationToRoute: locationToRoute,
    routeToLocation: routeToLocation
  };
}
//# sourceMappingURL=index.js.map