import "core-js/modules/es.symbol";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.join";
import "core-js/modules/es.function.name";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.to-string";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.search";
import "core-js/modules/es.string.split";
import "core-js/modules/web.dom-collections.for-each";
import "core-js/modules/web.dom-collections.iterator";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import { compilePath, compileToPath, matchPath } from './matchPath';

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

function pathnameParse(pathname, routeConfig, path, args) {
  for (var _rule in routeConfig) {
    if (routeConfig.hasOwnProperty(_rule)) {
      var match = matchPath(pathname, _rule);

      if (match) {
        var item = routeConfig[_rule];

        var _ref = typeof item === 'string' ? [item, null] : item,
            _viewName = _ref[0],
            pathConfig = _ref[1];

        path.push(_viewName);

        var _moduleName = _viewName.split('.')[0];

        var url = match.url,
            params = match.params;

        if (params && Object.keys(params).length > 0) {
          args[_moduleName] = _objectSpread({}, args[_moduleName], params);
        }

        if (pathConfig) {
          pathnameParse(pathname.replace(url, ''), pathConfig, path, args);
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
        var _compilePath = compilePath(_rule2),
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

export function buildLocationToRoute(routeConfig) {
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
    var urls = [];
    var args = {};

    for (var _moduleName3 in params) {
      if (params.hasOwnProperty(_moduleName3)) {
        args[_moduleName3] = _objectSpread({}, params[_moduleName3]);
      }
    }

    var _loop3 = function _loop3() {
      if (_isArray) {
        if (_i >= _iterator.length) return "break";
        _ref3 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) return "break";
        _ref3 = _i.value;
      }

      var viewName = _ref3;
      var rule = viewToRule[viewName];
      var moduleName = viewName.split('.')[0];
      var toPath = compileToPath(rule);
      var url = toPath(params[moduleName]);
      urls.push(url);
      var keys = ruleToKeys[rule] || [];
      keys.forEach(function (key) {
        delete args[moduleName][key];
      });
    };

    for (var _iterator = paths, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref3;

      var _ret = _loop3();

      if (_ret === "break") break;
    }

    var searchData = {};
    var hashData = {};

    var _loop2 = function _loop2(_moduleName4) {
      if (args.hasOwnProperty(_moduleName4)) {
        var data = args[_moduleName4];
        var keys = Object.keys(data);

        if (keys.length > 0) {
          keys.forEach(function (key) {
            if (key.indexOf('_') === 0) {
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
      pathname: urls.join(''),
      search: searchStringify(searchData),
      hash: searchStringify(hashData)
    };
  };

  return {
    locationToRoute: locationToRoute,
    routeToLocation: routeToLocation
  };
}
//# sourceMappingURL=routePlanA.js.map