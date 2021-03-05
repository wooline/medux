import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _extends from "@babel/runtime/helpers/esm/extends";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { CoreModuleHandlers, config, reducer, deepMergeState, mergeState, env, deepMerge, isPromise } from '@medux/core';
import { uriToLocation, nativeUrlToNativeLocation as _nativeUrlToNativeLocation, nativeLocationToNativeUrl as _nativeLocationToNativeUrl, History, routeConfig } from './basic';
export { setRouteConfig, routeConfig, nativeUrlToNativeLocation } from './basic';
export { PagenameMap, createLocationTransform } from './transform';
export var RouteModuleHandlers = _decorate(null, function (_initialize, _CoreModuleHandlers) {
  var RouteModuleHandlers = function (_CoreModuleHandlers2) {
    _inheritsLoose(RouteModuleHandlers, _CoreModuleHandlers2);

    function RouteModuleHandlers() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _CoreModuleHandlers2.call.apply(_CoreModuleHandlers2, [this].concat(args)) || this;

      _initialize(_assertThisInitialized(_this));

      return _this;
    }

    return RouteModuleHandlers;
  }(_CoreModuleHandlers);

  return {
    F: RouteModuleHandlers,
    d: [{
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        var routeParams = this.rootState.route.params[this.moduleName];
        return routeParams ? deepMergeState(initState, routeParams) : initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return deepMergeState(this.state, payload);
      }
    }]
  };
}, CoreModuleHandlers);
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
export function routeParamsAction(moduleName, params, action) {
  return {
    type: "" + moduleName + config.NSP + RouteActionTypes.MRouteParams,
    payload: [params, action]
  };
}
export function routeChangeAction(routeState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState]
  };
}
export var routeMiddleware = function routeMiddleware(_ref) {
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
export var routeReducer = function routeReducer(state, action) {
  if (action.type === RouteActionTypes.RouteChange) {
    return mergeState(state, action.payload[0]);
  }

  return state;
};

function dataIsNativeLocation(data) {
  return data['pathname'];
}

export var BaseNativeRouter = function () {
  function BaseNativeRouter() {
    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "router", null);
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
      } else if (isPromise(result)) {
        result.catch(function (e) {
          reject(e);
          _this2.curTask = undefined;
        });
      }
    });
  };

  return BaseNativeRouter;
}();
export var BaseRouter = function () {
  function BaseRouter(nativeLocationOrNativeUrl, nativeRouter, locationTransform) {
    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "_nativeData", void 0);

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "meduxUrl", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "history", void 0);

    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;
    nativeRouter.setRouter(this);
    var location = typeof nativeLocationOrNativeUrl === 'string' ? this.nativeUrlToLocation(nativeLocationOrNativeUrl) : this.nativeLocationToLocation(nativeLocationOrNativeUrl);

    var key = this._createKey();

    var routeState = _extends({}, location, {
      action: 'RELAUNCH',
      key: key
    });

    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this._nativeData = undefined;
    this.history = new History();
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
    return _nativeUrlToNativeLocation(url);
  };

  _proto2.nativeLocationToLocation = function nativeLocationToLocation(nativeLocation) {
    var location;

    try {
      location = this.locationTransform.in(nativeLocation);
    } catch (error) {
      env.console.warn(error);
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
      env.console.warn(error);
      location = {
        pagename: '/',
        params: {}
      };
    }

    return location;
  };

  _proto2.nativeLocationToNativeUrl = function nativeLocationToNativeUrl(nativeLocation) {
    return _nativeLocationToNativeUrl(nativeLocation);
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
      params = deepMerge({}, extendParams, params);
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
      disableNative = routeConfig.disableNativeRoute;
    }

    this.addTask(this._relaunch.bind(this, data, internal, disableNative));
  };

  _proto2._relaunch = function () {
    var _relaunch2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(data, internal, disableNative) {
      var _this3 = this;

      var location, key, routeState, nativeData;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
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
              routeState = _extends({}, location, {
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
      disableNative = routeConfig.disableNativeRoute;
    }

    this.addTask(this._push.bind(this, data, internal, disableNative));
  };

  _proto2._push = function () {
    var _push2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(data, internal, disableNative) {
      var _this4 = this;

      var location, key, routeState, nativeData;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
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
              routeState = _extends({}, location, {
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
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().push(location, key);
              } else {
                this.history.push(location, key);
              }

              return _context2.abrupt("return", routeState);

            case 15:
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
      disableNative = routeConfig.disableNativeRoute;
    }

    this.addTask(this._replace.bind(this, data, internal, disableNative));
  };

  _proto2._replace = function () {
    var _replace2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(data, internal, disableNative) {
      var _this5 = this;

      var location, key, routeState, nativeData;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
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
              routeState = _extends({}, location, {
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
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().replace(location, key);
              } else {
                this.history.replace(location, key);
              }

              return _context3.abrupt("return", routeState);

            case 15:
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

  _proto2.back = function back(n, internal, disableNative) {
    if (n === void 0) {
      n = 1;
    }

    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = routeConfig.disableNativeRoute;
    }

    this.addTask(this._back.bind(this, n, internal, disableNative));
  };

  _proto2._back = function () {
    var _back2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(n, internal, disableNative) {
      var _this6 = this;

      var stack, uri, _uriToLocation, key, location, routeState, nativeData;

      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (n === void 0) {
                n = 1;
              }

              stack = internal ? this.history.getCurrentInternalHistory().getActionRecord(n) : this.history.getActionRecord(n);

              if (stack) {
                _context4.next = 4;
                break;
              }

              return _context4.abrupt("return", Promise.reject(1));

            case 4:
              uri = stack.uri;
              _uriToLocation = uriToLocation(uri), key = _uriToLocation.key, location = _uriToLocation.location;
              routeState = _extends({}, location, {
                action: 'BACK',
                key: key
              });
              _context4.next = 9;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 9:
              if (disableNative) {
                _context4.next = 13;
                break;
              }

              _context4.next = 12;
              return this.nativeRouter.execute('back', function () {
                var nativeLocation = _this6.locationTransform.out(routeState);

                var nativeUrl = _this6.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, n, key, internal);

            case 12:
              nativeData = _context4.sent;

            case 13:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().back(n);
              } else {
                this.history.back(n);
              }

              return _context4.abrupt("return", routeState);

            case 19:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function _back(_x10, _x11, _x12) {
      return _back2.apply(this, arguments);
    }

    return _back;
  }();

  _proto2.pop = function pop(n, internal, disableNative) {
    if (n === void 0) {
      n = 1;
    }

    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = routeConfig.disableNativeRoute;
    }

    this.addTask(this._pop.bind(this, n, internal, disableNative));
  };

  _proto2._pop = function () {
    var _pop2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(n, internal, disableNative) {
      var _this7 = this;

      var stack, uri, _uriToLocation2, key, location, routeState, nativeData;

      return _regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (n === void 0) {
                n = 1;
              }

              stack = internal ? this.history.getCurrentInternalHistory().getPageRecord(n) : this.history.getPageRecord(n);

              if (stack) {
                _context5.next = 4;
                break;
              }

              return _context5.abrupt("return", Promise.reject(1));

            case 4:
              uri = stack.uri;
              _uriToLocation2 = uriToLocation(uri), key = _uriToLocation2.key, location = _uriToLocation2.location;
              routeState = _extends({}, location, {
                action: 'POP',
                key: key
              });
              _context5.next = 9;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 9:
              if (disableNative) {
                _context5.next = 13;
                break;
              }

              _context5.next = 12;
              return this.nativeRouter.execute('pop', function () {
                var nativeLocation = _this7.locationTransform.out(routeState);

                var nativeUrl = _this7.nativeLocationToNativeUrl(nativeLocation);

                return {
                  nativeLocation: nativeLocation,
                  nativeUrl: nativeUrl
                };
              }, n, key, internal);

            case 12:
              nativeData = _context5.sent;

            case 13:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.meduxUrl = this.locationToMeduxUrl(routeState);
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().pop(n);
              } else {
                this.history.pop(n);
              }

              return _context5.abrupt("return", routeState);

            case 19:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function _pop(_x13, _x14, _x15) {
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