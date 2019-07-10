import "core-js/modules/es.symbol";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.to-string";
import "core-js/modules/es.string.ends-with";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.search";
import "core-js/modules/es.string.split";
import "core-js/modules/es.string.starts-with";
import "core-js/modules/web.dom-collections.for-each";
import "core-js/modules/web.dom-collections.iterator";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import { ActionTypes, NSP, defaultRouteParams, getActionData, routeCompleteAction } from '@medux/core';
import { compilePath, compileToPath, matchPath } from './matchPath';
import assignDeep from 'deep-extend'; // 排除默认路由参数，路由中如果参数值与默认参数相同可省去

function excludeDefaultData(data, def) {
  var result = {};

  for (var _key in data) {
    if (data.hasOwnProperty(_key)) {
      var value = data[_key];
      var defaultValue = def[_key];

      if (value !== defaultValue) {
        if (typeof value === typeof defaultValue && typeof value === 'object' && !Array.isArray(value)) {
          result[_key] = excludeDefaultData(value, defaultValue);
        } else {
          result[_key] = value;
        }
      }
    }
  }

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

export var mergeDefaultParamsMiddleware = function mergeDefaultParamsMiddleware(_ref) {
  var dispatch = _ref.dispatch,
      getState = _ref.getState;
  return function (next) {
    return function (action) {
      if (action.type === ActionTypes.F_ROUTE_CHANGE) {
        var payload = getActionData(action);

        var _getState = getState(),
            route = _getState.route;

        if (route) {
          var locationInStore = route.location || {};
          var location = payload.location || {};

          if (locationInStore.pathname === location.pathname && locationInStore.search === location.search && locationInStore.hash === location.hash) {
            return;
          }
        }

        var params = mergeDefaultData(payload.data.views, payload.data.params, defaultRouteParams);
        action = _objectSpread({}, action, {
          payload: _objectSpread({}, payload, {
            data: _objectSpread({}, payload.data, {
              params: params
            })
          })
        });
        setTimeout(function () {
          return dispatch(routeCompleteAction());
        }, 0);
        return next(action);
      } else {
        var _action$type$split = action.type.split(NSP),
            _moduleName = _action$type$split[0],
            actionName = _action$type$split[1];

        if (_moduleName && actionName === ActionTypes.M_INIT) {
          var _mergeDefaultData;

          var _getState2 = getState(),
              _route = _getState2.route;

          var _params = _route.data.params || {};

          var moduleParams = _params[_moduleName];

          var _payload = getActionData(action);

          var routeParams = mergeDefaultData((_mergeDefaultData = {}, _mergeDefaultData[_moduleName] = true, _mergeDefaultData), moduleParams, defaultRouteParams)[_moduleName] || {};
          action = _objectSpread({}, action, {
            payload: _objectSpread({}, _payload, {
              routeParams: routeParams
            })
          });
          setTimeout(function () {
            return dispatch(routeCompleteAction());
          }, 0);
          return next(action);
        }
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
      var match = matchPath(pathname, {
        path: _rule.replace(/\$$/, ''),
        exact: _rule.endsWith('$')
      });

      if (match) {
        var item = routeConfig[_rule];

        var _ref2 = typeof item === 'string' ? [item, null] : item,
            _viewName = _ref2[0],
            pathConfig = _ref2[1];

        paths.push(_viewName);

        var _moduleName2 = _viewName.split('.')[0];

        var params = match.params;

        if (params && Object.keys(params).length > 0) {
          args[_moduleName2] = _objectSpread({}, args[_moduleName2], params);
        }

        if (pathConfig) {
          pathnameParse(pathname, pathConfig, paths, args);
        }

        return;
      }
    }
  }
}

function compileConfig(routeConfig, viewToRule, ruleToKeys) {
  if (viewToRule === void 0) {
    viewToRule = {};
  }

  if (ruleToKeys === void 0) {
    ruleToKeys = {};
  }

  for (var _rule2 in routeConfig) {
    if (routeConfig.hasOwnProperty(_rule2)) {
      if (!ruleToKeys[_rule2]) {
        var _compilePath = compilePath(_rule2.replace(/\$$/, ''), {
          end: _rule2.endsWith('$'),
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

      var _ref3 = typeof item === 'string' ? [item, null] : item,
          _viewName2 = _ref3[0],
          pathConfig = _ref3[1];

      viewToRule[_viewName2] = _rule2;

      if (pathConfig) {
        compileConfig(pathConfig, viewToRule, ruleToKeys);
      }
    }
  }

  return {
    viewToRule: viewToRule,
    ruleToKeys: ruleToKeys
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
    var hashParams = searchParse(location.hash) || {};

    var _loop = function _loop(_moduleName3) {
      if (hashParams.hasOwnProperty(_moduleName3)) {
        var moduleParams = hashParams[_moduleName3];
        Object.keys(moduleParams).forEach(function (key) {
          params[_moduleName3][key] = moduleParams[key];
        });
      }
    };

    for (var _moduleName3 in hashParams) {
      _loop(_moduleName3);
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

      for (var _moduleName4 in params) {
        if (params.hasOwnProperty(_moduleName4)) {
          args[_moduleName4] = _objectSpread({}, params[_moduleName4]);
        }
      }

      var lastViewName = paths[paths.length - 1];

      var _loop2 = function _loop2() {
        if (_isArray) {
          if (_i >= _iterator.length) return "break";
          _ref4 = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) return "break";
          _ref4 = _i.value;
        }

        var viewName = _ref4;
        var rule = viewToRule[viewName];
        var moduleName = viewName.split('.')[0]; //最深的一个view可以决定pathname

        if (viewName === lastViewName) {
          var toPath = compileToPath(rule.replace(/\$$/, ''));
          pathname = toPath(params[moduleName]);
        } //pathname中传递的值可以不在params中重复传递


        var keys = ruleToKeys[rule] || [];
        keys.forEach(function (key) {
          delete args[moduleName][key];
        });
      };

      for (var _iterator = paths, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref4;

        var _ret = _loop2();

        if (_ret === "break") break;
      }
    } else {
      args = params;
    } //将带_前缀的变量放到hashData中


    var searchData = {};
    var hashData = {};

    var _loop3 = function _loop3(_moduleName5) {
      if (args.hasOwnProperty(_moduleName5)) {
        var data = args[_moduleName5];
        var keys = Object.keys(data);

        if (keys.length > 0) {
          keys.forEach(function (key) {
            if (key.startsWith('_')) {
              if (!hashData[_moduleName5]) {
                hashData[_moduleName5] = {};
              }

              hashData[_moduleName5][key] = data[key];
            } else {
              if (!searchData[_moduleName5]) {
                searchData[_moduleName5] = {};
              }

              searchData[_moduleName5][key] = data[key];
            }
          });
        }
      }
    };

    for (var _moduleName5 in args) {
      _loop3(_moduleName5);
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