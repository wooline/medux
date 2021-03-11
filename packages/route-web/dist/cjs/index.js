"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.beforeRouteChangeAction = beforeRouteChangeAction;
exports.routeParamsAction = routeParamsAction;
exports.routeChangeAction = routeChangeAction;
exports.BaseRouter = exports.BaseNativeRouter = exports.routeReducer = exports.routeMiddleware = exports.RouteActionTypes = exports.RouteModuleHandlers = exports.createLocationTransform = exports.PagenameMap = exports.nativeUrlToNativeLocation = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _core = require("@medux/core");

var _basic = require("./basic");

exports.routeConfig = _basic.routeConfig;
exports.setRouteConfig = _basic.setRouteConfig;
exports.nativeUrlToNativeLocation = _basic.nativeUrlToNativeLocation;

var _transform = require("./transform");

exports.PagenameMap = _transform.PagenameMap;
exports.createLocationTransform = _transform.createLocationTransform;
var RouteModuleHandlers = (0, _decorate2.default)(null, function (_initialize, _CoreModuleHandlers) {
  var RouteModuleHandlers = function (_CoreModuleHandlers2) {
    (0, _inheritsLoose2.default)(RouteModuleHandlers, _CoreModuleHandlers2);

    function RouteModuleHandlers() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _CoreModuleHandlers2.call.apply(_CoreModuleHandlers2, [this].concat(args)) || this;

      _initialize((0, _assertThisInitialized2.default)(_this));

      return _this;
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
        return routeParams ? (0, _core.deepMergeState)(initState, routeParams) : initState;
      }
    }, {
      kind: "method",
      decorators: [_core.reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return (0, _core.deepMergeState)(this.state, payload);
      }
    }]
  };
}, _core.CoreModuleHandlers);
exports.RouteModuleHandlers = RouteModuleHandlers;
var RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: "medux" + _core.config.NSP + "RouteChange",
  BeforeRouteChange: "medux" + _core.config.NSP + "BeforeRouteChange"
};
exports.RouteActionTypes = RouteActionTypes;

function beforeRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState]
  };
}

function routeParamsAction(moduleName, params, action) {
  return {
    type: "" + moduleName + _core.config.NSP + RouteActionTypes.MRouteParams,
    payload: [params, action]
  };
}

function routeChangeAction(routeState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState]
  };
}

var routeMiddleware = function routeMiddleware(_ref) {
  var dispatch = _ref.dispatch,
      getState = _ref.getState;
  return function (next) {
    return function (action) {
      if (action.type === RouteActionTypes.RouteChange) {
        var routeState = action.payload[0];
        var rootRouteParams = routeState.params;
        var rootState = getState();
        Object.keys(rootRouteParams).forEach(function (moduleName) {
          var routeParams = rootRouteParams[moduleName];

          if (routeParams) {
            var _rootState$moduleName;

            if ((_rootState$moduleName = rootState[moduleName]) != null && _rootState$moduleName.initialized) {
              dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
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
  if (action.type === RouteActionTypes.RouteChange) {
    return (0, _core.mergeState)(state, action.payload[0]);
  }

  return state;
};

exports.routeReducer = routeReducer;

function dataIsNativeLocation(data) {
  return data['pathname'];
}

var BaseNativeRouter = function () {
  function BaseNativeRouter() {
    (0, _defineProperty2.default)(this, "curTask", void 0);
    (0, _defineProperty2.default)(this, "taskList", []);
    (0, _defineProperty2.default)(this, "router", null);
  }

  var _proto = BaseNativeRouter.prototype;

  _proto.onChange = function onChange(key) {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }

    return key !== this.router.getCurKey();
  };

  _proto.setRouter = function setRouter(router) {
    this.router = router;
  };

  _proto.execute = function execute(method, getNativeData) {
    var _this2 = this;

    for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }

    return new Promise(function (resolve, reject) {
      var task = {
        resolve: resolve,
        reject: reject,
        nativeData: undefined
      };
      _this2.curTask = task;

      var result = _this2[method].apply(_this2, [function () {
        var nativeData = getNativeData();
        task.nativeData = nativeData;
        return nativeData;
      }].concat(args));

      if (!result) {
        resolve(undefined);
        _this2.curTask = undefined;
      } else if ((0, _core.isPromise)(result)) {
        result.catch(function (e) {
          reject(e);
          _this2.curTask = undefined;
        });
      }
    });
  };

  return BaseNativeRouter;
}();

exports.BaseNativeRouter = BaseNativeRouter;

var BaseRouter = function () {
  function BaseRouter(nativeLocationOrNativeUrl, nativeRouter, locationTransform) {
    (0, _defineProperty2.default)(this, "_tid", 0);
    (0, _defineProperty2.default)(this, "curTask", void 0);
    (0, _defineProperty2.default)(this, "taskList", []);
    (0, _defineProperty2.default)(this, "_nativeData", void 0);
    (0, _defineProperty2.default)(this, "routeState", void 0);
    (0, _defineProperty2.default)(this, "meduxUrl", void 0);
    (0, _defineProperty2.default)(this, "store", void 0);
    (0, _defineProperty2.default)(this, "history", void 0);
    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;
    nativeRouter.setRouter(this);
    var location = typeof nativeLocationOrNativeUrl === 'string' ? this.nativeUrlToLocation(nativeLocationOrNativeUrl) : this.nativeLocationToLocation(nativeLocationOrNativeUrl);

    var key = this._createKey();

    var routeState = (0, _extends2.default)({}, location, {
      action: 'RELAUNCH',
      key: key
    });
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);

    if (!_basic.routeConfig.indexUrl) {
      (0, _basic.setRouteConfig)({
        indexUrl: this.meduxUrl
      });
    }

    this._nativeData = undefined;
    this.history = new _basic.History();
    this.history.relaunch(location, key);
  }

  var _proto2 = BaseRouter.prototype;

  _proto2.getRouteState = function getRouteState() {
    return this.routeState;
  };

  _proto2.getPagename = function getPagename() {
    return this.routeState.pagename;
  };

  _proto2.getParams = function getParams() {
    return this.routeState.params;
  };

  _proto2.getMeduxUrl = function getMeduxUrl() {
    return this.meduxUrl;
  };

  _proto2.getNativeLocation = function getNativeLocation() {
    if (!this._nativeData) {
      var nativeLocation = this.locationTransform.out(this.routeState);
      var nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {
        nativeLocation: nativeLocation,
        nativeUrl: nativeUrl
      };
    }

    return this._nativeData.nativeLocation;
  };

  _proto2.getNativeUrl = function getNativeUrl() {
    if (!this._nativeData) {
      var nativeLocation = this.locationTransform.out(this.routeState);
      var nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {
        nativeLocation: nativeLocation,
        nativeUrl: nativeUrl
      };
    }

    return this._nativeData.nativeUrl;
  };

  _proto2.setStore = function setStore(_store) {
    this.store = _store;
  };

  _proto2.getCurKey = function getCurKey() {
    return this.routeState.key;
  };

  _proto2.searchKeyInActions = function searchKeyInActions(key) {
    return this.history.getActionIndex(key);
  };

  _proto2._createKey = function _createKey() {
    this._tid++;
    return "" + this._tid;
  };

  _proto2.nativeUrlToNativeLocation = function nativeUrlToNativeLocation(url) {
    return (0, _basic.nativeUrlToNativeLocation)(url);
  };

  _proto2.nativeLocationToLocation = function nativeLocationToLocation(nativeLocation) {
    var location;

    try {
      location = this.locationTransform.in(nativeLocation);
    } catch (error) {
      _core.env.console.warn(error);

      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  };

  _proto2.nativeUrlToLocation = function nativeUrlToLocation(nativeUrl) {
    return this.nativeLocationToLocation(this.nativeUrlToNativeLocation(nativeUrl));
  };

  _proto2.urlToLocation = function urlToLocation(url) {
    var _url$split = url.split('?'),
        pathname = _url$split[0],
        others = _url$split.slice(1);

    var query = others.join('?');
    var location;

    try {
      if (query.startsWith('{')) {
        var data = JSON.parse(query);
        location = this.locationTransform.in({
          pagename: pathname,
          params: data
        });
      } else {
        var nativeLocation = this.nativeUrlToNativeLocation(url);
        location = this.locationTransform.in(nativeLocation);
      }
    } catch (error) {
      _core.env.console.warn(error);

      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  };

  _proto2.nativeLocationToNativeUrl = function nativeLocationToNativeUrl(nativeLocation) {
    return (0, _basic.nativeLocationToNativeUrl)(nativeLocation);
  };

  _proto2.locationToNativeUrl = function locationToNativeUrl(location) {
    var nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToNativeUrl(nativeLocation);
  };

  _proto2.locationToMeduxUrl = function locationToMeduxUrl(location) {
    return [location.pagename, JSON.stringify(location.params || {})].join('?');
  };

  _proto2.payloadToPartial = function payloadToPartial(payload) {
    var params = payload.params;
    var extendParams = payload.extendParams === 'current' ? this.routeState.params : payload.extendParams;

    if (extendParams && params) {
      params = (0, _core.deepMerge)({}, extendParams, params);
    } else if (extendParams) {
      params = extendParams;
    }

    return {
      pagename: payload.pagename || this.routeState.pagename,
      params: params || {}
    };
  };

  _proto2.relaunch = function relaunch(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._relaunch.bind(this, data, internal, disableNative));
  };

  _proto2._relaunch = function () {
    var _relaunch2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data, internal, disableNative) {
      var _this3 = this;

      var location, key, routeState, nativeData;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (typeof data === 'string') {
                location = this.urlToLocation(data);
              } else if (dataIsNativeLocation(data)) {
                location = this.nativeLocationToLocation(data);
              } else {
                location = this.locationTransform.in(this.payloadToPartial(data));
              }

              key = this._createKey();
              routeState = (0, _extends2.default)({}, location, {
                action: 'RELAUNCH',
                key: key
              });
              _context.next = 5;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 5:
              if (disableNative) {
                _context.next = 9;
                break;
              }

              _context.next = 8;
              return this.nativeRouter.execute('relaunch', function () {
                var nativeLocation = _this3.locationTransform.out(routeState);

                var nativeUrl = _this3.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, key, internal);

            case 8:
              nativeData = _context.sent;

            case 9:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().relaunch(location, key);
              } else {
                this.history.relaunch(location, key);
              }

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function _relaunch(_x, _x2, _x3) {
      return _relaunch2.apply(this, arguments);
    }

    return _relaunch;
  }();

  _proto2.push = function push(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._push.bind(this, data, internal, disableNative));
  };

  _proto2._push = function () {
    var _push2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(data, internal, disableNative) {
      var _this4 = this;

      var location, key, routeState, nativeData;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (typeof data === 'string') {
                location = this.urlToLocation(data);
              } else if (dataIsNativeLocation(data)) {
                location = this.nativeLocationToLocation(data);
              } else {
                location = this.locationTransform.in(this.payloadToPartial(data));
              }

              key = this._createKey();
              routeState = (0, _extends2.default)({}, location, {
                action: 'PUSH',
                key: key
              });
              _context2.next = 5;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 5:
              if (disableNative) {
                _context2.next = 9;
                break;
              }

              _context2.next = 8;
              return this.nativeRouter.execute('push', function () {
                var nativeLocation = _this4.locationTransform.out(routeState);

                var nativeUrl = _this4.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, key, internal);

            case 8:
              nativeData = _context2.sent;

            case 9:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);

              if (internal) {
                this.history.getCurrentInternalHistory().push(location, key);
              } else {
                this.history.push(location, key);
              }

              this.store.dispatch(routeChangeAction(routeState));

            case 14:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function _push(_x4, _x5, _x6) {
      return _push2.apply(this, arguments);
    }

    return _push;
  }();

  _proto2.replace = function replace(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._replace.bind(this, data, internal, disableNative));
  };

  _proto2._replace = function () {
    var _replace2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(data, internal, disableNative) {
      var _this5 = this;

      var location, key, routeState, nativeData;
      return _regenerator.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (typeof data === 'string') {
                location = this.urlToLocation(data);
              } else if (dataIsNativeLocation(data)) {
                location = this.nativeLocationToLocation(data);
              } else {
                location = this.locationTransform.in(this.payloadToPartial(data));
              }

              key = this._createKey();
              routeState = (0, _extends2.default)({}, location, {
                action: 'REPLACE',
                key: key
              });
              _context3.next = 5;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 5:
              if (disableNative) {
                _context3.next = 9;
                break;
              }

              _context3.next = 8;
              return this.nativeRouter.execute('replace', function () {
                var nativeLocation = _this5.locationTransform.out(routeState);

                var nativeUrl = _this5.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, key, internal);

            case 8:
              nativeData = _context3.sent;

            case 9:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);

              if (internal) {
                this.history.getCurrentInternalHistory().replace(location, key);
              } else {
                this.history.replace(location, key);
              }

              this.store.dispatch(routeChangeAction(routeState));

            case 14:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function _replace(_x7, _x8, _x9) {
      return _replace2.apply(this, arguments);
    }

    return _replace;
  }();

  _proto2.back = function back(n, indexUrl, internal, disableNative) {
    if (n === void 0) {
      n = 1;
    }

    if (indexUrl === void 0) {
      indexUrl = 'index';
    }

    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._back.bind(this, n, indexUrl === 'index' ? _basic.routeConfig.indexUrl : indexUrl, internal, disableNative));
  };

  _proto2._back = function () {
    var _back2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(n, indexUrl, internal, disableNative) {
      var _this6 = this;

      var stack, uri, _uriToLocation, key, location, routeState, nativeData;

      return _regenerator.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (n === void 0) {
                n = 1;
              }

              stack = internal ? this.history.getCurrentInternalHistory().getActionRecord(n) : this.history.getActionRecord(n);

              if (stack) {
                _context4.next = 6;
                break;
              }

              if (!indexUrl) {
                _context4.next = 5;
                break;
              }

              return _context4.abrupt("return", this._relaunch(indexUrl || _basic.routeConfig.indexUrl, internal, disableNative));

            case 5:
              throw {
                code: '1',
                message: 'history not found'
              };

            case 6:
              uri = stack.uri;
              _uriToLocation = (0, _basic.uriToLocation)(uri), key = _uriToLocation.key, location = _uriToLocation.location;
              routeState = (0, _extends2.default)({}, location, {
                action: 'BACK',
                key: key
              });
              _context4.next = 11;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 11:
              if (disableNative) {
                _context4.next = 15;
                break;
              }

              _context4.next = 14;
              return this.nativeRouter.execute('back', function () {
                var nativeLocation = _this6.locationTransform.out(routeState);

                var nativeUrl = _this6.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, n, key, internal);

            case 14:
              nativeData = _context4.sent;

            case 15:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);

              if (internal) {
                this.history.getCurrentInternalHistory().back(n);
              } else {
                this.history.back(n);
              }

              this.store.dispatch(routeChangeAction(routeState));
              return _context4.abrupt("return", undefined);

            case 21:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function _back(_x10, _x11, _x12, _x13) {
      return _back2.apply(this, arguments);
    }

    return _back;
  }();

  _proto2.pop = function pop(n, indexUrl, internal, disableNative) {
    if (n === void 0) {
      n = 1;
    }

    if (indexUrl === void 0) {
      indexUrl = 'index';
    }

    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._pop.bind(this, n, indexUrl === 'index' ? _basic.routeConfig.indexUrl : indexUrl, internal, disableNative));
    return true;
  };

  _proto2._pop = function () {
    var _pop2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee5(n, indexUrl, internal, disableNative) {
      var _this7 = this;

      var stack, uri, _uriToLocation2, key, location, routeState, nativeData;

      return _regenerator.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (n === void 0) {
                n = 1;
              }

              if (indexUrl === void 0) {
                indexUrl = '';
              }

              stack = internal ? this.history.getCurrentInternalHistory().getPageRecord(n) : this.history.getPageRecord(n);

              if (stack) {
                _context5.next = 5;
                break;
              }

              return _context5.abrupt("return", this._relaunch(indexUrl || _basic.routeConfig.indexUrl, internal, disableNative));

            case 5:
              uri = stack.uri;
              _uriToLocation2 = (0, _basic.uriToLocation)(uri), key = _uriToLocation2.key, location = _uriToLocation2.location;
              routeState = (0, _extends2.default)({}, location, {
                action: 'POP',
                key: key
              });
              _context5.next = 10;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 10:
              if (disableNative) {
                _context5.next = 14;
                break;
              }

              _context5.next = 13;
              return this.nativeRouter.execute('pop', function () {
                var nativeLocation = _this7.locationTransform.out(routeState);

                var nativeUrl = _this7.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, n, key, internal);

            case 13:
              nativeData = _context5.sent;

            case 14:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);

              if (internal) {
                this.history.getCurrentInternalHistory().pop(n);
              } else {
                this.history.pop(n);
              }

              this.store.dispatch(routeChangeAction(routeState));
              return _context5.abrupt("return", undefined);

            case 20:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function _pop(_x14, _x15, _x16, _x17) {
      return _pop2.apply(this, arguments);
    }

    return _pop;
  }();

  _proto2.taskComplete = function taskComplete() {
    var task = this.taskList.shift();

    if (task) {
      this.executeTask(task);
    } else {
      this.curTask = undefined;
    }
  };

  _proto2.executeTask = function executeTask(task) {
    this.curTask = task;
    task().finally(this.taskComplete.bind(this));
  };

  _proto2.addTask = function addTask(task) {
    if (this.curTask) {
      this.taskList.push(task);
    } else {
      this.executeTask(task);
    }
  };

  _proto2.destroy = function destroy() {
    this.nativeRouter.destroy();
  };

  return BaseRouter;
}();

exports.BaseRouter = BaseRouter;