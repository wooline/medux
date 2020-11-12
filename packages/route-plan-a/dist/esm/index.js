import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { config, CoreModelHandlers, reducer, moduleInitAction } from '@medux/core';
import { compileToPath, matchPath } from './matchPath';
import { RouteActionTypes, routeConfig, checkLocation, compileRule, urlToLocation, locationToUrl, dataIsLocation, routeChangeAction, beforeRouteChangeAction, routeParamsAction } from './basic';
import assignDeep from './deep-extend';
export var deepAssign = assignDeep;
export { setRouteConfig } from './basic';

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

  if (routeConfig.escape) {
    search = unescape(search);
  }

  try {
    return JSON.parse(search, routeConfig.dateParse ? dateParse : undefined);
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

  if (routeConfig.escape) {
    return escape(str);
  }

  return str;
}

function splitSearch(search) {
  var reg = new RegExp("[?&#]" + routeConfig.splitKey + "=([^&]+)");
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

      var match = matchPath(pathname, {
        path: _rule.replace(/\$$/, ''),
        exact: !pathConfig
      });

      if (match) {
        paths.push(_viewName);

        var _moduleName = _viewName.split(config.VSP)[0];

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

export function assignRouteData(paths, params, defaultRouteParams) {
  var views = paths.reduce(function (prev, cur) {
    var _cur$split = cur.split(config.VSP),
        moduleName = _cur$split[0],
        viewName = _cur$split[1];

    if (moduleName && viewName) {
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
    params[moduleName] = assignDeep({}, defaultRouteParams[moduleName], params[moduleName]);
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
  var paramsFilter = assignDeep({}, params);
  var pathname = '';
  var views = {};
  paths.reduce(function (parentAbsoluteViewName, viewName, index) {
    var _viewName$split = viewName.split(config.VSP),
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
      var toPath = compileToPath(rule);
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

export var BaseHistoryActions = function () {
  function BaseHistoryActions(nativeHistory, defaultRouteParams, initUrl, routeRule, locationMap) {
    this.nativeHistory = nativeHistory;
    this.defaultRouteParams = defaultRouteParams;
    this.initUrl = initUrl;
    this.routeRule = routeRule;
    this.locationMap = locationMap;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "_routeState", void 0);

    _defineProperty(this, "_startupRouteState", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "_viewToRule", void 0);

    _defineProperty(this, "_ruleToKeys", void 0);

    var _compileRule = compileRule(routeRule),
        viewToRule = _compileRule.viewToRule,
        ruleToKeys = _compileRule.ruleToKeys;

    this._viewToRule = viewToRule;
    this._ruleToKeys = ruleToKeys;
    var safeLocation = urlToLocation(initUrl);

    var routeState = this._createRouteState(safeLocation, 'RELAUNCH', '');

    this._routeState = routeState;
    this._startupRouteState = routeState;
  }

  var _proto = BaseHistoryActions.prototype;

  _proto.setStore = function setStore(_store) {
    this.store = _store;
  };

  _proto.mergeInitState = function mergeInitState(initState) {
    var routeState = this.getRouteState();
    var data = Object.assign(Object.assign({}, initState), {}, {
      route: routeState
    });
    Object.keys(routeState.views).forEach(function (moduleName) {
      if (!data[moduleName]) {
        data[moduleName] = {};
      }

      data[moduleName] = Object.assign(Object.assign({}, data[moduleName]), {}, {
        routeParams: routeState.params[moduleName]
      });
    });
    return data;
  };

  _proto.getCurKey = function getCurKey() {
    return this._routeState.key;
  };

  _proto.getRouteState = function getRouteState() {
    return this._routeState;
  };

  _proto.locationToRoute = function locationToRoute(safeLocation) {
    var url = locationToUrl(safeLocation);
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
    assignDeep(params, hashParams);
    var routeData = assignRouteData(paths, assignDeep(pathsArgs, params), this.defaultRouteParams);
    cacheData.unshift({
      url: url,
      routeData: routeData
    });
    cacheData.length = 100;
    return routeData;
  };

  _proto.routeToLocation = function routeToLocation(paths, params) {
    params = params || {};
    var pathname;
    var views = {};

    if (typeof paths === 'string') {
      pathname = paths;
    } else {
      var data = pathsToPathname(paths, params, this._viewToRule, this._ruleToKeys);
      pathname = data.pathname;
      params = data.params;
      views = data.views;
    }

    var paramsFilter = excludeDefaultData(params, this.defaultRouteParams, false, views);

    var _extractHashData = extractHashData(paramsFilter),
        search = _extractHashData.search,
        hash = _extractHashData.hash;

    return {
      pathname: pathname,
      search: search ? "?" + routeConfig.splitKey + "=" + search : '',
      hash: hash ? "#" + routeConfig.splitKey + "=" + hash : ''
    };
  };

  _proto.payloadToRoute = function payloadToRoute(data) {
    if (typeof data === 'string') {
      return this.locationToRoute(urlToLocation(data));
    }

    if (dataIsLocation(data)) {
      return this.locationToRoute(checkLocation(data));
    }

    var params = data.extendParams ? assignDeep({}, data.extendParams, data.params) : data.params;
    var paths = [];

    if (typeof data.paths === 'string') {
      var pathname = data.paths;
      pathnameParse(pathname, this.routeRule, paths, {});
    } else {
      paths = data.paths;
    }

    return assignRouteData(paths, params || {}, this.defaultRouteParams);
  };

  _proto.payloadToLocation = function payloadToLocation(data) {
    if (typeof data === 'string') {
      return urlToLocation(data);
    }

    if (dataIsLocation(data)) {
      return checkLocation(data);
    }

    var params = data.extendParams ? assignDeep({}, data.extendParams, data.params) : data.params;
    return this.routeToLocation(data.paths, params);
  };

  _proto._createKey = function _createKey() {
    this._tid++;
    return "" + this._tid;
  };

  _proto._getEfficientLocation = function _getEfficientLocation(safeLocation) {
    var routeData = this.locationToRoute(safeLocation);

    if (routeData.views['@']) {
      var url = Object.keys(routeData.views['@'])[0];
      var reLocation = urlToLocation(url);
      return this._getEfficientLocation(reLocation);
    }

    return {
      location: safeLocation,
      routeData: routeData
    };
  };

  _proto._buildHistory = function _buildHistory(location) {
    var _this = this;

    var maxLength = routeConfig.historyMax;
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
    return "" + key + routeConfig.RSP + url;
  };

  _proto._uriToUrl = function _uriToUrl(uri) {
    if (uri === void 0) {
      uri = '';
    }

    return uri.substr(uri.indexOf(routeConfig.RSP) + 1);
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

    return uri.substr(0, uri.indexOf(routeConfig.RSP));
  };

  _proto.findHistoryByKey = function findHistoryByKey(key) {
    var history = this._routeState.history;
    var index = history.findIndex(function (uri) {
      return uri.startsWith("" + key + routeConfig.RSP);
    });
    return {
      index: index,
      url: index > -1 ? this._uriToUrl(history[index]) : ''
    };
  };

  _proto._toNativeLocation = function _toNativeLocation(location) {
    if (this.locationMap) {
      var nLocation = checkLocation(this.locationMap.out(location));
      return Object.assign(Object.assign({}, nLocation), {}, {
        action: location.action,
        url: locationToUrl(nLocation),
        key: location.key
      });
    }

    return location;
  };

  _proto._createRouteState = function _createRouteState(safeLocation, action, key) {
    key = key || this._createKey();

    var data = this._getEfficientLocation(safeLocation);

    var location = Object.assign(Object.assign({}, data.location), {}, {
      action: action,
      url: locationToUrl(data.location),
      key: key
    });

    var _this$_buildHistory = this._buildHistory(location),
        history = _this$_buildHistory.history,
        stack = _this$_buildHistory.stack;

    var routeState = Object.assign(Object.assign(Object.assign({}, location), data.routeData), {}, {
      history: history,
      stack: stack
    });
    return routeState;
  };

  _proto.dispatch = function () {
    var _dispatch = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(safeLocation, action, key, callNative) {
      var routeState, nativeLocation;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (key === void 0) {
                key = '';
              }

              routeState = this._createRouteState(safeLocation, action, key);
              _context.next = 4;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 4:
              this._routeState = routeState;
              _context.next = 7;
              return this.store.dispatch(routeChangeAction(routeState));

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

      var paLocation = urlToLocation(_url);
      return this.dispatch(paLocation, "POP" + n, _key2, disableNative ? '' : n);
    }

    var url = root;

    if (root === 'HOME') {
      url = routeConfig.homeUrl;
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

    return this.relaunch(root === 'HOME' ? routeConfig.homeUrl : this._startupRouteState.url, disableNative);
  };

  return BaseHistoryActions;
}();
export var routeMiddleware = function routeMiddleware(_ref3) {
  var dispatch = _ref3.dispatch,
      getState = _ref3.getState;
  return function (next) {
    return function (action) {
      if (action.type === RouteActionTypes.RouteChange) {
        var result = next(action);
        var routeState = action.payload[0];
        var rootRouteParams = routeState.params;
        var rootState = getState();
        Object.keys(rootRouteParams).forEach(function (moduleName) {
          var routeParams = rootRouteParams[moduleName];

          if (routeParams) {
            var _rootState$moduleName;

            if ((_rootState$moduleName = rootState[moduleName]) === null || _rootState$moduleName === void 0 ? void 0 : _rootState$moduleName.initialized) {
              dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
            } else {
              dispatch(moduleInitAction(moduleName, undefined));
            }
          }
        });
        return result;
      }

      return next(action);
    };
  };
};
export var routeReducer = function routeReducer(state, action) {
  if (action.type === RouteActionTypes.RouteChange) {
    return action.payload[0];
  }

  return state;
};
export var RouteModelHandlers = _decorate(null, function (_initialize, _CoreModelHandlers) {
  var RouteModelHandlers = function (_CoreModelHandlers2) {
    _inheritsLoose(RouteModelHandlers, _CoreModelHandlers2);

    function RouteModelHandlers() {
      var _this2;

      for (var _len = arguments.length, args = new Array(_len), _key3 = 0; _key3 < _len; _key3++) {
        args[_key3] = arguments[_key3];
      }

      _this2 = _CoreModelHandlers2.call.apply(_CoreModelHandlers2, [this].concat(args)) || this;

      _initialize(_assertThisInitialized(_this2));

      return _this2;
    }

    return RouteModelHandlers;
  }(_CoreModelHandlers);

  return {
    F: RouteModelHandlers,
    d: [{
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        var rootState = this.getRootState();
        var routeParams = rootState.route.params[this.moduleName];
        return Object.assign(Object.assign({}, initState), {}, {
          routeParams: routeParams
        });
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        var state = this.getState();
        return Object.assign(Object.assign({}, state), {}, {
          routeParams: payload
        });
      }
    }]
  };
}, CoreModelHandlers);