"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.assignRouteData = assignRouteData;
exports.RouteModuleHandlers = exports.routeReducer = exports.routeMiddleware = exports.BaseHistoryActions = exports.setRouteConfig = exports.deepAssign = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@medux/core");

var _matchPath = require("./matchPath");

var _basic = require("./basic");

exports.setRouteConfig = _basic.setRouteConfig;

var _deepExtend = _interopRequireDefault(require("./deep-extend"));

var deepAssign = _deepExtend.default;
exports.deepAssign = deepAssign;

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

  if (_basic.routeConfig.escape) {
    search = unescape(search);
  }

  try {
    return JSON.parse(search, _basic.routeConfig.dateParse ? dateParse : undefined);
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

  if (_basic.routeConfig.escape) {
    return escape(str);
  }

  return str;
}

function splitSearch(search) {
  var reg = new RegExp("[?&#]" + _basic.routeConfig.splitKey + "=([^&]+)");
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

function pathnameParse(pathname, routeRule, paths, args) {
  for (var _rule in routeRule) {
    if (routeRule.hasOwnProperty(_rule)) {
      var item = routeRule[_rule];

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

        var params = match.params;

        if (params && Object.keys(params).length > 0) {
          args[_moduleName] = Object.assign(args[_moduleName] || {}, checkPathArgs(params));
        }

        if (pathConfig) {
          pathnameParse(pathname, pathConfig, paths, args);
        }

        return;
      }
    }
  }
}

function assignRouteData(paths, params, defaultRouteParams) {
  var views = paths.reduce(function (prev, cur) {
    var _cur$split = cur.split(_core.config.VSP),
        moduleName = _cur$split[0],
        viewName = _cur$split[1];

    if (moduleName && viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }

      prev[moduleName][viewName] = true;

      if (!params[moduleName]) {
        params[moduleName] = undefined;
      }
    }

    return prev;
  }, {});
  Object.keys(params).forEach(function (moduleName) {
    if (defaultRouteParams[moduleName]) {
      params[moduleName] = (0, _deepExtend.default)({}, defaultRouteParams[moduleName], params[moduleName]);
    }
  });
  return {
    views: views,
    paths: paths,
    params: params
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

function pathsToPathname(paths, params, viewToRule, ruleToKeys) {
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

    if (moduleName && view) {
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

var BaseHistoryActions = function () {
  function BaseHistoryActions(nativeHistory, defaultRouteParams, initUrl, routeRule, locationMap) {
    this.nativeHistory = nativeHistory;
    this.defaultRouteParams = defaultRouteParams;
    this.initUrl = initUrl;
    this.routeRule = routeRule;
    this.locationMap = locationMap;
    (0, _defineProperty2.default)(this, "_tid", 0);
    (0, _defineProperty2.default)(this, "_routeState", void 0);
    (0, _defineProperty2.default)(this, "_startupRouteState", void 0);
    (0, _defineProperty2.default)(this, "store", void 0);
    (0, _defineProperty2.default)(this, "_viewToRule", void 0);
    (0, _defineProperty2.default)(this, "_ruleToKeys", void 0);

    var _compileRule = (0, _basic.compileRule)(routeRule),
        viewToRule = _compileRule.viewToRule,
        ruleToKeys = _compileRule.ruleToKeys;

    this._viewToRule = viewToRule;
    this._ruleToKeys = ruleToKeys;
    var safeLocation = (0, _basic.urlToLocation)(initUrl);

    var routeState = this._createRouteState(safeLocation, 'RELAUNCH', '');

    this._routeState = routeState;
    this._startupRouteState = routeState;
    nativeHistory.relaunch(routeState);
  }

  var _proto = BaseHistoryActions.prototype;

  _proto.setStore = function setStore(_store) {
    this.store = _store;
  };

  _proto.mergeInitState = function mergeInitState(initState) {
    var routeState = this.getRouteState();
    var data = Object.assign({}, initState, {
      route: routeState
    });
    Object.keys(routeState.views).forEach(function (moduleName) {
      if (!data[moduleName]) {
        data[moduleName] = {};
      }

      data[moduleName] = Object.assign({}, data[moduleName], {
        routeParams: routeState.params[moduleName]
      });
    });
    return data;
  };

  _proto.getModulePath = function getModulePath() {
    return this.getRouteState().paths.map(function (viewName) {
      return viewName.split(_core.config.VSP)[0];
    });
  };

  _proto.getCurKey = function getCurKey() {
    return this._routeState.key;
  };

  _proto.getRouteState = function getRouteState() {
    return this._routeState;
  };

  _proto.locationToUrl = function locationToUrl(safeLocation) {
    return safeLocation.pathname + safeLocation.search + safeLocation.hash;
  };

  _proto.locationToRoute = function locationToRoute(safeLocation) {
    var url = this.locationToUrl(safeLocation);
    var item = cacheData.find(function (val) {
      return val && val.url === url;
    });

    if (item) {
      return item.routeData;
    }

    var pathname = safeLocation.pathname;
    var paths = [];
    var pathsArgs = {};
    pathnameParse(pathname, this.routeRule, paths, pathsArgs);
    var params = splitSearch(safeLocation.search);
    var hashParams = splitSearch(safeLocation.hash);
    (0, _deepExtend.default)(params, hashParams);
    var routeData = assignRouteData(paths, (0, _deepExtend.default)(pathsArgs, params), this.defaultRouteParams);
    cacheData.unshift({
      url: url,
      routeData: routeData
    });
    cacheData.length = 100;
    return routeData;
  };

  _proto.routeToLocation = function routeToLocation(paths, params) {
    params = params || {};
    var views = {};
    var data = pathsToPathname(paths, params, this._viewToRule, this._ruleToKeys);
    var pathname = data.pathname;
    params = data.params;
    views = data.views;
    var paramsFilter = excludeDefaultData(params, this.defaultRouteParams, false, views);

    var _extractHashData = extractHashData(paramsFilter),
        search = _extractHashData.search,
        hash = _extractHashData.hash;

    return {
      pathname: pathname,
      search: search ? "?" + _basic.routeConfig.splitKey + "=" + search : '',
      hash: hash ? "#" + _basic.routeConfig.splitKey + "=" + hash : ''
    };
  };

  _proto.payloadToRoute = function payloadToRoute(data) {
    if (typeof data === 'string') {
      return this.locationToRoute((0, _basic.urlToLocation)(data));
    }

    if (data.pathname && !data.extendParams && !data.params) {
      return this.locationToRoute((0, _basic.checkLocation)(data));
    }

    var clone = Object.assign({}, data);

    if (clone.extendParams === true) {
      clone.extendParams = this.getRouteState().params;
    }

    if (clone.pathname) {
      clone.paths = [];
      clone.params = {};
      pathnameParse(clone.pathname, this.routeRule, clone.paths, clone.params);
      (0, _deepExtend.default)(clone.params, data.params);
    }

    if (!clone.paths) {
      clone.paths = this.getRouteState().paths;
    }

    var params = clone.extendParams ? (0, _deepExtend.default)({}, clone.extendParams, clone.params) : clone.params;
    return assignRouteData(clone.paths, params || {}, this.defaultRouteParams);
  };

  _proto.payloadToLocation = function payloadToLocation(data) {
    if (typeof data === 'string') {
      return (0, _basic.urlToLocation)(data);
    }

    if (data.pathname && !data.extendParams && !data.params) {
      return (0, _basic.checkLocation)(data);
    }

    var clone = Object.assign({}, data);

    if (clone.extendParams === true) {
      clone.extendParams = this.getRouteState().params;
    }

    if (clone.pathname) {
      clone.paths = [];
      clone.params = {};
      pathnameParse(clone.pathname, this.routeRule, clone.paths, clone.params);
      (0, _deepExtend.default)(clone.params, data.params);
    }

    if (!clone.paths) {
      clone.paths = this.getRouteState().paths;
    }

    var params = clone.extendParams ? (0, _deepExtend.default)({}, clone.extendParams, clone.params) : clone.params;
    return this.routeToLocation(clone.paths, params);
  };

  _proto._createKey = function _createKey() {
    this._tid++;
    return "" + this._tid;
  };

  _proto._getEfficientLocation = function _getEfficientLocation(safeLocation) {
    var routeData = this.locationToRoute(safeLocation);

    if (routeData.views['@']) {
      var url = Object.keys(routeData.views['@'])[0];
      var reLocation = (0, _basic.urlToLocation)(url);
      return this._getEfficientLocation(reLocation);
    }

    return {
      location: safeLocation,
      routeData: routeData
    };
  };

  _proto._buildHistory = function _buildHistory(location) {
    var _this = this;

    var maxLength = _basic.routeConfig.historyMax;
    var action = location.action,
        url = location.url,
        pathname = location.pathname,
        key = location.key;

    var _ref2 = this._routeState || {
      history: [],
      stack: []
    },
        history = _ref2.history,
        stack = _ref2.stack;

    var uri = this._urlToUri(url, key);

    var historyList = [].concat(history);
    var stackList = [].concat(stack);

    if (action === 'RELAUNCH') {
      historyList = [uri];
      stackList = [pathname];
    } else if (action === 'PUSH') {
      historyList.unshift(uri);

      if (historyList.length > maxLength) {
        historyList.length = maxLength;
      }

      if (stackList[0] !== pathname) {
        stackList.unshift(pathname);
      }

      if (stackList.length > maxLength) {
        stackList.length = maxLength;
      }
    } else if (action === 'REPLACE') {
      historyList[0] = uri;

      if (stackList[0] !== pathname) {
        var cpathname = this._uriToPathname(historyList[1]);

        if (cpathname !== stackList[0]) {
          stackList.shift();
        }

        if (stackList[0] !== pathname) {
          stackList.unshift(pathname);
        }

        if (stackList.length > maxLength) {
          stackList.length = maxLength;
        }
      }
    } else if (action.startsWith('POP')) {
      var _n = parseInt(action.replace('POP', ''), 10) || 1;

      var arr = historyList.splice(0, _n + 1, uri).reduce(function (pre, curUri) {
        var cpathname = _this._uriToPathname(curUri);

        if (pre[pre.length - 1] !== cpathname) {
          pre.push(cpathname);
        }

        return pre;
      }, []);

      if (arr[arr.length - 1] === this._uriToPathname(historyList[1])) {
        arr.pop();
      }

      stackList.splice(0, arr.length, pathname);

      if (stackList[0] === stackList[1]) {
        stackList.shift();
      }
    }

    return {
      history: historyList,
      stack: stackList
    };
  };

  _proto._urlToUri = function _urlToUri(url, key) {
    return "" + key + _basic.routeConfig.RSP + url;
  };

  _proto._uriToUrl = function _uriToUrl(uri) {
    if (uri === void 0) {
      uri = '';
    }

    return uri.substr(uri.indexOf(_basic.routeConfig.RSP) + 1);
  };

  _proto._uriToPathname = function _uriToPathname(uri) {
    if (uri === void 0) {
      uri = '';
    }

    var url = this._uriToUrl(uri);

    return url.split(/[?#]/)[0];
  };

  _proto._uriToKey = function _uriToKey(uri) {
    if (uri === void 0) {
      uri = '';
    }

    return uri.substr(0, uri.indexOf(_basic.routeConfig.RSP));
  };

  _proto.findHistoryByKey = function findHistoryByKey(key) {
    var history = this._routeState.history;
    var index = history.findIndex(function (uri) {
      return uri.startsWith("" + key + _basic.routeConfig.RSP);
    });
    return {
      index: index,
      url: index > -1 ? this._uriToUrl(history[index]) : ''
    };
  };

  _proto._toNativeLocation = function _toNativeLocation(location) {
    if (this.locationMap) {
      var nLocation = (0, _basic.checkLocation)(this.locationMap.out(location));
      return Object.assign({}, nLocation, {
        action: location.action,
        url: this.locationToUrl(nLocation),
        key: location.key
      });
    }

    return location;
  };

  _proto._createRouteState = function _createRouteState(safeLocation, action, key) {
    key = key || this._createKey();

    var data = this._getEfficientLocation(safeLocation);

    var location = Object.assign({}, data.location, {
      action: action,
      url: this.locationToUrl(data.location),
      key: key
    });

    var _this$_buildHistory = this._buildHistory(location),
        history = _this$_buildHistory.history,
        stack = _this$_buildHistory.stack;

    var routeState = Object.assign({}, location, data.routeData, {
      history: history,
      stack: stack
    });
    return routeState;
  };

  _proto.dispatch = function () {
    var _dispatch = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(safeLocation, action, key, callNative) {
      var routeState, nativeLocation;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (key === void 0) {
                key = '';
              }

              routeState = this._createRouteState(safeLocation, action, key);
              _context.next = 4;
              return this.store.dispatch((0, _basic.beforeRouteChangeAction)(routeState));

            case 4:
              this._routeState = routeState;
              _context.next = 7;
              return this.store.dispatch((0, _basic.routeChangeAction)(routeState));

            case 7:
              if (callNative) {
                nativeLocation = this._toNativeLocation(routeState);

                if (typeof callNative === 'number') {
                  this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative);
                } else {
                  this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation);
                }
              }

              return _context.abrupt("return", routeState);

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function dispatch(_x, _x2, _x3, _x4) {
      return _dispatch.apply(this, arguments);
    }

    return dispatch;
  }();

  _proto.relaunch = function relaunch(data, disableNative) {
    var paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'RELAUNCH', '', disableNative ? '' : 'relaunch');
  };

  _proto.push = function push(data, disableNative) {
    var paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'PUSH', '', disableNative ? '' : 'push');
  };

  _proto.replace = function replace(data, disableNative) {
    var paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'REPLACE', '', disableNative ? '' : 'replace');
  };

  _proto.pop = function pop(n, root, disableNative) {
    if (n === void 0) {
      n = 1;
    }

    if (root === void 0) {
      root = 'FIRST';
    }

    n = n || 1;
    var uri = this._routeState.history[n];

    if (uri) {
      var _url = this._uriToUrl(uri);

      var _key2 = this._uriToKey(uri);

      var paLocation = (0, _basic.urlToLocation)(_url);
      return this.dispatch(paLocation, "POP" + n, _key2, disableNative ? '' : n);
    }

    var url = root;

    if (root === 'HOME') {
      url = _basic.routeConfig.homeUrl;
    } else if (root === 'FIRST') {
      url = this._startupRouteState.url;
    }

    if (!url) {
      return Promise.reject(1);
    }

    return this.relaunch(url, disableNative);
  };

  _proto.home = function home(root, disableNative) {
    if (root === void 0) {
      root = 'FIRST';
    }

    return this.relaunch(root === 'HOME' ? _basic.routeConfig.homeUrl : this._startupRouteState.url, disableNative);
  };

  return BaseHistoryActions;
}();

exports.BaseHistoryActions = BaseHistoryActions;

var routeMiddleware = function routeMiddleware(_ref3) {
  var dispatch = _ref3.dispatch,
      getState = _ref3.getState;
  return function (next) {
    return function (action) {
      if (action.type === _basic.RouteActionTypes.RouteChange) {
        var routeState = action.payload[0];
        var rootRouteParams = routeState.params;
        var rootState = getState();
        Object.keys(rootRouteParams).forEach(function (moduleName) {
          var routeParams = rootRouteParams[moduleName];

          if (routeParams) {
            var _rootState$moduleName;

            if ((_rootState$moduleName = rootState[moduleName]) === null || _rootState$moduleName === void 0 ? void 0 : _rootState$moduleName.initialized) {
              dispatch((0, _basic.routeParamsAction)(moduleName, routeParams, routeState.action));
            }
          }
        });
      }

      return next(action);
    };
  };
};

exports.routeMiddleware = routeMiddleware;

var routeReducer = function routeReducer(state, action) {
  if (action.type === _basic.RouteActionTypes.RouteChange) {
    return action.payload[0];
  }

  return state;
};

exports.routeReducer = routeReducer;
var RouteModuleHandlers = (0, _decorate2.default)(null, function (_initialize, _CoreModuleHandlers) {
  var RouteModuleHandlers = function (_CoreModuleHandlers2) {
    (0, _inheritsLoose2.default)(RouteModuleHandlers, _CoreModuleHandlers2);

    function RouteModuleHandlers() {
      var _this2;

      for (var _len = arguments.length, args = new Array(_len), _key3 = 0; _key3 < _len; _key3++) {
        args[_key3] = arguments[_key3];
      }

      _this2 = _CoreModuleHandlers2.call.apply(_CoreModuleHandlers2, [this].concat(args)) || this;

      _initialize((0, _assertThisInitialized2.default)(_this2));

      return _this2;
    }

    return RouteModuleHandlers;
  }(_CoreModuleHandlers);

  return {
    F: RouteModuleHandlers,
    d: [{
      kind: "method",
      decorators: [_core.reducer],
      key: "Init",
      value: function Init(initState) {
        var routeParams = this.rootState.route.params[this.moduleName];
        return routeParams ? Object.assign({}, initState, {
          routeParams: routeParams
        }) : initState;
      }
    }, {
      kind: "method",
      decorators: [_core.reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return Object.assign({}, this.state, {
          routeParams: payload
        });
      }
    }]
  };
}, _core.CoreModuleHandlers);
exports.RouteModuleHandlers = RouteModuleHandlers;