"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.setRouteConfig = setRouteConfig;
exports.assignRouteData = assignRouteData;
exports.buildTransformRoute = buildTransformRoute;
exports.BaseHistoryActions = exports.deepAssign = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@medux/core");

var _utils = require("./utils");

exports.checkLocation = _utils.checkLocation;
exports.checkUrl = _utils.checkUrl;
exports.safelocationToUrl = _utils.safelocationToUrl;
exports.safeurlToLocation = _utils.safeurlToLocation;

var _matchPath = require("./matchPath");

var _deepExtend = _interopRequireDefault(require("./deep-extend"));

function dataIsLocation(data) {
  return !!data['pathname'];
}

var deepAssign = _deepExtend.default;
exports.deepAssign = deepAssign;
var config = {
  escape: true,
  dateParse: false,
  splitKey: 'q',
  defaultRouteParams: {}
};

function setRouteConfig(conf) {
  conf.escape !== undefined && (config.escape = conf.escape);
  conf.dateParse !== undefined && (config.dateParse = conf.dateParse);
  conf.splitKey && (config.splitKey = conf.splitKey);
  conf.defaultRouteParams && (config.defaultRouteParams = conf.defaultRouteParams);
}

function excludeDefaultData(data, def, holde, views) {
  var result = {};
  Object.keys(data).forEach(function (moduleName) {
    var value = data[moduleName];
    var defaultValue = def[moduleName];

    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && typeof value === 'object' && !Array.isArray(value)) {
        value = excludeDefaultData(value, defaultValue, !!views && !views[moduleName]);
      }

      if (value !== undefined) {
        result[moduleName] = value;
      }
    }
  });

  if (Object.keys(result).length === 0 && !holde) {
    return undefined;
  }

  return result;
}

var ISO_DATE_FORMAT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;

function dateParse(prop, value) {
  if (typeof value === 'string' && ISO_DATE_FORMAT.test(value)) {
    return new Date(value);
  }

  return value;
}

function searchParse(search) {
  if (!search) {
    return {};
  }

  if (config.escape) {
    search = unescape(search);
  }

  try {
    return JSON.parse(search, config.dateParse ? dateParse : undefined);
  } catch (error) {
    return {};
  }
}

function searchStringify(searchData) {
  if (typeof searchData !== 'object') {
    return '';
  }

  var str = JSON.stringify(searchData);

  if (str === '{}') {
    return '';
  }

  if (config.escape) {
    return escape(str);
  }

  return str;
}

function splitSearch(search) {
  var reg = new RegExp("[?&#]" + config.splitKey + "=([^&]+)");
  var arr = search.match(reg);

  if (arr) {
    return searchParse(arr[1]);
  }

  return {};
}

function checkPathArgs(params) {
  var obj = {};

  for (var _key in params) {
    if (params.hasOwnProperty(_key)) {
      (function () {
        var val = params[_key];

        var props = _key.split('.');

        if (props.length > 1) {
          props.reduce(function (prev, cur, index, arr) {
            if (index === arr.length - 1) {
              prev[cur] = val;
            } else {
              prev[cur] = {};
            }

            return prev[cur];
          }, obj);
        } else {
          obj[_key] = val;
        }
      })();
    }
  }

  return obj;
}

function pathnameParse(pathname, routeConfig, paths, args) {
  for (var _rule in routeConfig) {
    if (routeConfig.hasOwnProperty(_rule)) {
      var item = routeConfig[_rule];

      var _ref = typeof item === 'string' ? [item, null] : item,
          _viewName = _ref[0],
          pathConfig = _ref[1];

      var match = (0, _matchPath.matchPath)(pathname, {
        path: _rule.replace(/\$$/, ''),
        exact: !pathConfig
      });

      if (match) {
        paths.push(_viewName);

        var _moduleName = _viewName.split(_core.config.VSP)[0];

        var _params = match.params;

        if (_params && Object.keys(_params).length > 0) {
          args[_moduleName] = Object.assign(args[_moduleName] || {}, checkPathArgs(_params));
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

  for (var _rule2 in routeConfig) {
    if (routeConfig.hasOwnProperty(_rule2)) {
      var item = routeConfig[_rule2];

      var _ref2 = typeof item === 'string' ? [item, null] : item,
          _viewName2 = _ref2[0],
          pathConfig = _ref2[1];

      if (!ruleToKeys[_rule2]) {
        var _compilePath = (0, _matchPath.compilePath)(_rule2, {
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

      var absoluteViewName = parentAbsoluteViewName + "/" + _viewName2;
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

function assignRouteData(paths, params, action) {
  var views = paths.reduce(function (prev, cur) {
    var _cur$split = cur.split(_core.config.VSP),
        moduleName = _cur$split[0],
        viewName = _cur$split[1];

    if (moduleName !== '@' && viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }

      prev[moduleName][viewName] = true;

      if (!params[moduleName]) {
        params[moduleName] = {};
      }
    }

    return prev;
  }, {});
  Object.keys(params).forEach(function (moduleName) {
    params[moduleName] = (0, _deepExtend.default)({}, config.defaultRouteParams[moduleName], params[moduleName]);
  });
  return {
    views: views,
    paths: paths,
    params: params,
    action: action
  };
}

function extractHashData(params) {
  var searchParams = {};
  var hashParams = {};

  var _loop = function _loop(_moduleName2) {
    if (params[_moduleName2] && params.hasOwnProperty(_moduleName2)) {
      var data = params[_moduleName2];
      var keys = Object.keys(data);

      if (keys.length > 0) {
        keys.forEach(function (key) {
          if (key.startsWith('_')) {
            if (!hashParams[_moduleName2]) {
              hashParams[_moduleName2] = {};
            }

            hashParams[_moduleName2][key] = data[key];
          } else {
            if (!searchParams[_moduleName2]) {
              searchParams[_moduleName2] = {};
            }

            searchParams[_moduleName2][key] = data[key];
          }
        });
      } else {
        searchParams[_moduleName2] = {};
      }
    }
  };

  for (var _moduleName2 in params) {
    _loop(_moduleName2);
  }

  return {
    search: searchStringify(searchParams),
    hash: searchStringify(hashParams)
  };
}

var cacheData = [];

function buildTransformRoute(routeConfig, getCurPathname) {
  var _compileConfig = compileConfig(routeConfig),
      viewToRule = _compileConfig.viewToRule,
      ruleToKeys = _compileConfig.ruleToKeys;

  var transformRoute = {
    locationToRoute: function locationToRoute(location) {
      var safeLocation = (0, _utils.checkLocation)(location, getCurPathname());
      var url = (0, _utils.safelocationToUrl)(safeLocation);
      var item = cacheData.find(function (val) {
        return val && val.url === url;
      });

      if (item) {
        item.routeData.action = safeLocation.action;
        return item.routeData;
      }

      var pathname = safeLocation.pathname;
      var paths = [];
      var pathsArgs = {};
      pathnameParse(pathname, routeConfig, paths, pathsArgs);
      var params = splitSearch(safeLocation.search);
      var hashParams = splitSearch(safeLocation.hash);
      (0, _deepExtend.default)(params, hashParams);
      var routeData = assignRouteData(paths, (0, _deepExtend.default)(pathsArgs, params), safeLocation.action);
      cacheData.unshift({
        url: url,
        routeData: routeData
      });
      cacheData.length = 100;
      return routeData;
    },
    routeToLocation: function routeToLocation(paths, params, action) {
      params = params || {};
      var pathname;
      var views = {};

      if (typeof paths === 'string') {
        pathname = (0, _utils.checkPathname)(paths, getCurPathname());
      } else {
        var data = pathsToPathname(paths, params);
        pathname = data.pathname;
        params = data.params;
        views = data.views;
      }

      var paramsFilter = excludeDefaultData(params, config.defaultRouteParams, false, views);

      var _extractHashData = extractHashData(paramsFilter),
          search = _extractHashData.search,
          hash = _extractHashData.hash;

      var location = {
        pathname: pathname,
        search: search ? "?" + config.splitKey + "=" + search : '',
        hash: hash ? "#" + config.splitKey + "=" + hash : '',
        action: action
      };
      return location;
    },
    payloadToLocation: function payloadToLocation(payload) {
      if (dataIsLocation(payload)) {
        return (0, _utils.checkLocation)(payload, getCurPathname());
      }

      var params = payload.extend ? (0, _deepExtend.default)({}, payload.extend.params, payload.params) : payload.params;
      var location = transformRoute.routeToLocation(payload.paths, params);
      return (0, _utils.checkLocation)(location, getCurPathname());
    },
    urlToLocation: function urlToLocation(url) {
      url = (0, _utils.checkUrl)(url, getCurPathname());
      return (0, _utils.safeurlToLocation)(url);
    }
  };

  function getPathProps(pathprops, moduleParas, deleteIt) {
    if (moduleParas === void 0) {
      moduleParas = {};
    }

    var val;

    if (typeof pathprops === 'string' && pathprops.indexOf('.') > -1) {
      var props = pathprops.split('.');
      var len = props.length - 1;
      props.reduce(function (p, c, i) {
        if (i === len) {
          val = p[c];
          deleteIt && delete p[c];
        }

        return p[c] || {};
      }, moduleParas);
    } else {
      val = moduleParas[pathprops];
      deleteIt && delete moduleParas[pathprops];
    }

    return val;
  }

  function pathsToPathname(paths, params) {
    if (params === void 0) {
      params = {};
    }

    var len = paths.length - 1;
    var paramsFilter = (0, _deepExtend.default)({}, params);
    var pathname = '';
    var views = {};
    paths.reduce(function (parentAbsoluteViewName, viewName, index) {
      var _viewName$split = viewName.split(_core.config.VSP),
          moduleName = _viewName$split[0],
          view = _viewName$split[1];

      var absoluteViewName = parentAbsoluteViewName + "/" + viewName;
      var rule = viewToRule[absoluteViewName];
      var keys = ruleToKeys[rule] || [];

      if (moduleName !== '@' && view) {
        if (!views[moduleName]) {
          views[moduleName] = {};
        }

        views[moduleName][view] = true;
      }

      if (index === len) {
        var toPath = (0, _matchPath.compileToPath)(rule);
        var args = keys.reduce(function (prev, cur) {
          prev[cur] = getPathProps(cur, params[moduleName]);
          return prev;
        }, {});
        pathname = toPath(args);
      }

      keys.forEach(function (key) {
        getPathProps(key, paramsFilter[moduleName], true);
      });
      return absoluteViewName;
    }, '');
    return {
      pathname: pathname,
      views: views,
      params: paramsFilter
    };
  }

  return transformRoute;
}

var BaseHistoryActions = function () {
  function BaseHistoryActions(location, initialized, _transformRoute) {
    this.initialized = initialized;
    this._transformRoute = _transformRoute;
    (0, _defineProperty2.default)(this, "_uid", 0);
    (0, _defineProperty2.default)(this, "_listenList", {});
    (0, _defineProperty2.default)(this, "_blockerList", {});
    (0, _defineProperty2.default)(this, "_location", void 0);
    (0, _defineProperty2.default)(this, "_startupLocation", void 0);
    this._location = location;
    this._startupLocation = this._location;
  }

  var _proto = BaseHistoryActions.prototype;

  _proto.equal = function equal(a, b) {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.action === b.action;
  };

  _proto.getLocation = function getLocation() {
    return this._location;
  };

  _proto.getRouteData = function getRouteData() {
    return this._transformRoute.locationToRoute(this.getLocation());
  };

  _proto.subscribe = function subscribe(listener) {
    var _this = this;

    this._uid++;
    var uid = this._uid;
    this._listenList[uid] = listener;
    return function () {
      delete _this._listenList[uid];
    };
  };

  _proto.block = function block(listener) {
    var _this2 = this;

    this._uid++;
    var uid = this._uid;
    this._blockerList[uid] = listener;
    return function () {
      delete _this2._blockerList[uid];
    };
  };

  _proto.locationToRouteData = function locationToRouteData(location) {
    return this._transformRoute.locationToRoute(location);
  };

  _proto.dispatch = function dispatch(location) {
    var _this3 = this;

    if (this.equal(location, this._location)) {
      return Promise.reject();
    }

    return Promise.all(Object.values(this._blockerList).map(function (fn) {
      return fn(location, _this3._location);
    })).then(function () {
      _this3._location = location;
      Object.values(_this3._listenList).forEach(function (listener) {
        return listener(location);
      });
    });
  };

  return BaseHistoryActions;
}();

exports.BaseHistoryActions = BaseHistoryActions;