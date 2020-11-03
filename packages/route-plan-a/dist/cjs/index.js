"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.checkLocation = checkLocation;
exports.urlToLocation = urlToLocation;
exports.locationToUrl = locationToUrl;
exports.setRouteConfig = setRouteConfig;
exports.assignRouteData = assignRouteData;
exports.BaseHistoryActions = exports.deepAssign = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@medux/core");

var _matchPath = require("./matchPath");

var _deepExtend = _interopRequireDefault(require("./deep-extend"));

function dataIsLocation(data) {
  return !!data['pathname'];
}

function checkLocation(location) {
  var data = Object.assign({}, location);
  data.pathname = ("/" + data.pathname).replace(/\/+/g, '/');

  if (data.pathname !== '/') {
    data.pathname = data.pathname.replace(/\/$/, '');
  }

  data.search = ("?" + (location.search || '')).replace('??', '?');
  data.hash = ("#" + (location.hash || '')).replace('##', '#');

  if (data.search === '?') {
    data.search = '';
  }

  if (data.hash === '#') {
    data.hash = '';
  }

  return data;
}

function urlToLocation(url) {
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

function locationToUrl(safeLocation) {
  return safeLocation.pathname + safeLocation.search + safeLocation.hash;
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

function assignRouteData(paths, params) {
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
  function BaseHistoryActions(nativeHistory, homeUrl, routeConfig, maxLength, locationMap) {
    this.nativeHistory = nativeHistory;
    this.homeUrl = homeUrl;
    this.routeConfig = routeConfig;
    this.maxLength = maxLength;
    this.locationMap = locationMap;
    (0, _defineProperty2.default)(this, "_tid", 0);
    (0, _defineProperty2.default)(this, "_uid", 0);
    (0, _defineProperty2.default)(this, "_RSP", '|');
    (0, _defineProperty2.default)(this, "_listenList", {});
    (0, _defineProperty2.default)(this, "_blockerList", {});
    (0, _defineProperty2.default)(this, "_location", void 0);
    (0, _defineProperty2.default)(this, "_routeData", void 0);
    (0, _defineProperty2.default)(this, "_startupLocation", void 0);
    (0, _defineProperty2.default)(this, "_startupRouteData", void 0);
    (0, _defineProperty2.default)(this, "_history", []);
    (0, _defineProperty2.default)(this, "_stack", []);
    (0, _defineProperty2.default)(this, "_viewToRule", void 0);
    (0, _defineProperty2.default)(this, "_ruleToKeys", void 0);

    var _compileConfig = compileConfig(routeConfig),
        viewToRule = _compileConfig.viewToRule,
        ruleToKeys = _compileConfig.ruleToKeys;

    this._viewToRule = viewToRule;
    this._ruleToKeys = ruleToKeys;
  }

  var _proto = BaseHistoryActions.prototype;

  _proto.getCurKey = function getCurKey() {
    var _this$getLocation;

    return ((_this$getLocation = this.getLocation()) === null || _this$getLocation === void 0 ? void 0 : _this$getLocation.key) || '';
  };

  _proto._getCurPathname = function _getCurPathname() {
    var _this$getLocation2;

    return ((_this$getLocation2 = this.getLocation()) === null || _this$getLocation2 === void 0 ? void 0 : _this$getLocation2.pathname) || '';
  };

  _proto.getLocation = function getLocation(startup) {
    return startup ? this._startupLocation : this._location;
  };

  _proto.getRouteData = function getRouteData(startup) {
    return startup ? this._startupRouteData : this._routeData;
  };

  _proto.getRouteState = function getRouteState() {
    if (this._location) {
      return {
        history: this._history,
        stack: this._stack,
        location: this._location,
        data: this._routeData
      };
    }

    return undefined;
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
    pathnameParse(pathname, this.routeConfig, paths, pathsArgs);
    var params = splitSearch(safeLocation.search);
    var hashParams = splitSearch(safeLocation.hash);
    (0, _deepExtend.default)(params, hashParams);
    var routeData = assignRouteData(paths, (0, _deepExtend.default)(pathsArgs, params));
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

    var paramsFilter = excludeDefaultData(params, config.defaultRouteParams, false, views);

    var _extractHashData = extractHashData(paramsFilter),
        search = _extractHashData.search,
        hash = _extractHashData.hash;

    return {
      pathname: pathname,
      search: search ? "?" + config.splitKey + "=" + search : '',
      hash: hash ? "#" + config.splitKey + "=" + hash : ''
    };
  };

  _proto.payloadToRoute = function payloadToRoute(data) {
    var params = data.extend ? (0, _deepExtend.default)({}, data.extend.params, data.params) : data.params;
    var paths = [];

    if (typeof data.paths === 'string') {
      var pathname = data.paths;
      pathnameParse(pathname, this.routeConfig, paths, {});
    } else {
      paths = data.paths;
    }

    return assignRouteData(paths, params || {});
  };

  _proto.payloadToLocation = function payloadToLocation(data) {
    if (typeof data === 'string') {
      return urlToLocation(data);
    }

    if (dataIsLocation(data)) {
      return checkLocation(data);
    }

    var params = data.extend ? (0, _deepExtend.default)({}, data.extend.params, data.params) : data.params;
    return this.routeToLocation(data.paths, params);
  };

  _proto._createKey = function _createKey() {
    this._tid++;
    return "" + this._tid;
  };

  _proto._getEfficientLocation = function _getEfficientLocation(safeLocation, curPathname) {
    var routeData = this.locationToRoute(safeLocation);

    if (routeData.views['@']) {
      var url = Object.keys(routeData.views['@'])[0];
      var reLocation = urlToLocation(url);
      return this._getEfficientLocation(reLocation, safeLocation.pathname);
    }

    return {
      location: safeLocation,
      routeData: routeData
    };
  };

  _proto._buildHistory = function _buildHistory(location) {
    var _this = this;

    var maxLength = this.maxLength;
    var action = location.action,
        url = location.url,
        pathname = location.pathname,
        key = location.key;

    var uri = this._urlToUri(url, key);

    var historyList = [].concat(this._history);
    var stackList = [].concat(this._stack);

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

  _proto.subscribe = function subscribe(listener) {
    var _this2 = this;

    this._uid++;
    var uid = this._uid;
    this._listenList[uid] = listener;
    return function () {
      delete _this2._listenList[uid];
    };
  };

  _proto.block = function block(listener) {
    var _this3 = this;

    this._uid++;
    var uid = this._uid;
    this._blockerList[uid] = listener;
    return function () {
      delete _this3._blockerList[uid];
    };
  };

  _proto._urlToUri = function _urlToUri(url, key) {
    return "" + key + this._RSP + url;
  };

  _proto._uriToUrl = function _uriToUrl(uri) {
    if (uri === void 0) {
      uri = '';
    }

    return uri.substr(uri.indexOf(this._RSP) + 1);
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

    return uri.substr(0, uri.indexOf(this._RSP));
  };

  _proto.findHistoryByKey = function findHistoryByKey(key) {
    var _this4 = this;

    var index = this._history.findIndex(function (uri) {
      return uri.startsWith("" + key + _this4._RSP);
    });

    return {
      index: index,
      url: index > -1 ? this._uriToUrl(this._history[index]) : ''
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

  _proto.dispatch = function dispatch(paLocation, action, key, callNative) {
    var _this5 = this;

    if (key === void 0) {
      key = '';
    }

    key = key || this._createKey();

    var data = this._getEfficientLocation(paLocation, this._getCurPathname());

    var location = Object.assign(Object.assign({}, data.location), {}, {
      action: action,
      url: locationToUrl(data.location),
      key: key
    });
    var routeData = Object.assign(Object.assign({}, data.routeData), {}, {
      action: action,
      key: key
    });
    return Promise.all(Object.values(this._blockerList).map(function (fn) {
      return fn(location, _this5.getLocation(), routeData, _this5.getRouteData());
    })).then(function () {
      _this5._location = location;
      _this5._routeData = routeData;

      if (!_this5._startupLocation) {
        _this5._startupLocation = location;
        _this5._startupRouteData = routeData;
      }

      var _this5$_buildHistory = _this5._buildHistory(location),
          history = _this5$_buildHistory.history,
          stack = _this5$_buildHistory.stack;

      _this5._history = history;
      _this5._stack = stack;
      Object.values(_this5._listenList).forEach(function (listener) {
        return listener({
          location: location,
          data: routeData,
          history: _this5._history,
          stack: _this5._stack
        });
      });

      if (callNative) {
        var nativeLocation = _this5._toNativeLocation(location);

        if (typeof callNative === 'number') {
          _this5.nativeHistory.pop && _this5.nativeHistory.pop(nativeLocation, callNative);
        } else {
          _this5.nativeHistory[callNative] && _this5.nativeHistory[callNative](nativeLocation);
        }
      }

      return location;
    });
  };

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
    var uri = this._history[n];

    if (uri) {
      var _url = this._uriToUrl(uri);

      var _key2 = this._uriToKey(uri);

      var paLocation = urlToLocation(_url);
      return this.dispatch(paLocation, "POP" + n, _key2, disableNative ? '' : n);
    }

    var url = root;

    if (root === 'HOME') {
      url = this.homeUrl;
    } else if (root === 'FIRST') {
      url = this._startupLocation.url;
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

    return this.relaunch(root === 'HOME' ? this.homeUrl : this._startupLocation.url, disableNative);
  };

  return BaseHistoryActions;
}();

exports.BaseHistoryActions = BaseHistoryActions;