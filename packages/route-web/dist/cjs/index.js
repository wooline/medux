"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.beforeRouteChangeAction = beforeRouteChangeAction;
exports.routeParamsAction = routeParamsAction;
exports.routeChangeAction = routeChangeAction;
exports.BaseRouter = exports.routeReducer = exports.routeMiddleware = exports.RouteActionTypes = exports.RouteModuleHandlers = exports.createPathnameTransform = exports.createLocationTransform = exports.PagenameMap = exports.routeConfig = exports.setRouteConfig = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _core = require("@medux/core");

var _basic = require("./basic");

exports.setRouteConfig = _basic.setRouteConfig;
exports.routeConfig = _basic.routeConfig;

var _transform = require("./transform");

exports.PagenameMap = _transform.PagenameMap;
exports.createLocationTransform = _transform.createLocationTransform;
exports.createPathnameTransform = _transform.createPathnameTransform;
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

            if ((_rootState$moduleName = rootState[moduleName]) !== null && _rootState$moduleName !== void 0 && _rootState$moduleName.initialized) {
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

var BaseRouter = function () {
  function BaseRouter(initUrl, nativeRouter, locationTransform) {
    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;
    (0, _defineProperty2.default)(this, "_tid", 0);
    (0, _defineProperty2.default)(this, "routeState", void 0);
    (0, _defineProperty2.default)(this, "nativeLocation", void 0);
    (0, _defineProperty2.default)(this, "url", void 0);
    (0, _defineProperty2.default)(this, "store", void 0);
    (0, _defineProperty2.default)(this, "history", void 0);
    this.nativeLocation = this.urlToNativeLocation(initUrl);
    this.url = this.nativeLocationToUrl(this.nativeLocation);
    var location = this.locationTransform.in(this.nativeLocation);

    var key = this._createKey();

    this.history = new _basic.History();
    var routeState = Object.assign({}, location, {
      action: 'RELAUNCH',
      key: key
    });
    this.routeState = routeState;
    this.history.relaunch(location, key);
  }

  var _proto = BaseRouter.prototype;

  _proto.getRouteState = function getRouteState() {
    return this.routeState;
  };

  _proto.getNativeLocation = function getNativeLocation() {
    return this.nativeLocation;
  };

  _proto.getUrl = function getUrl() {
    return this.url;
  };

  _proto.setStore = function setStore(_store) {
    this.store = _store;
  };

  _proto.getCurKey = function getCurKey() {
    return this.routeState.key;
  };

  _proto._createKey = function _createKey() {
    this._tid++;
    return "" + this._tid;
  };

  _proto.payloadToLocation = function payloadToLocation(data) {
    var pagename = data.pagename;
    var extendParams = data.extendParams === true ? this.routeState.params : data.extendParams;
    var params = extendParams && data.params ? (0, _core.deepMerge)({}, extendParams, data.params) : data.params;
    return {
      pagename: pagename || this.routeState.pagename || '/',
      params: params
    };
  };

  _proto.urlToToLocation = function urlToToLocation(url) {
    var nativeLocation = this.urlToNativeLocation(url);
    return this.locationTransform.in(nativeLocation);
  };

  _proto.urlToNativeLocation = function urlToNativeLocation(url) {
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

    var path = arr[0],
        _arr$ = arr[1],
        search = _arr$ === void 0 ? '' : _arr$,
        _arr$2 = arr[2],
        hash = _arr$2 === void 0 ? '' : _arr$2;
    var pathname = path;

    if (!pathname.startsWith('/')) {
      pathname = "/" + pathname;
    }

    pathname = pathname.replace(/\/*$/, '') || '/';
    return {
      pathname: pathname,
      search: search,
      hash: hash
    };
  };

  _proto.nativeLocationToUrl = function nativeLocationToUrl(nativeLocation) {
    var pathname = nativeLocation.pathname,
        search = nativeLocation.search,
        hash = nativeLocation.hash;
    return [pathname && pathname.replace(/\/*$/, ''), search && "?" + search, hash && "#" + hash].join('');
  };

  _proto.locationToUrl = function locationToUrl(location) {
    var nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToUrl(nativeLocation);
  };

  _proto.relaunch = function () {
    var _relaunch = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data, internal) {
      var location, key, routeState;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);
              key = this._createKey();
              routeState = Object.assign({}, location, {
                action: 'RELAUNCH',
                key: key
              });
              _context.next = 5;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 5:
              this.routeState = routeState;
              this.store.dispatch(routeChangeAction(routeState));
              this.nativeLocation = this.locationTransform.out(location);
              this.url = this.nativeLocationToUrl(this.nativeLocation);

              if (internal) {
                this.history.getCurrentInternalHistory().relaunch(location, key);
              } else {
                this.history.relaunch(location, key);
              }

              this.nativeRouter.relaunch(this.url, key, !!internal);
              return _context.abrupt("return", routeState);

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function relaunch(_x, _x2) {
      return _relaunch.apply(this, arguments);
    }

    return relaunch;
  }();

  _proto.push = function () {
    var _push = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(data, internal) {
      var location, key, routeState;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);
              key = this._createKey();
              routeState = Object.assign({}, location, {
                action: 'PUSH',
                key: key
              });
              _context2.next = 5;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 5:
              this.routeState = routeState;
              this.store.dispatch(routeChangeAction(routeState));
              this.nativeLocation = this.locationTransform.out(location);
              this.url = this.nativeLocationToUrl(this.nativeLocation);

              if (internal) {
                this.history.getCurrentInternalHistory().push(location, key);
              } else {
                this.history.push(location, key);
              }

              this.nativeRouter.push(this.url, key, !!internal);
              return _context2.abrupt("return", routeState);

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function push(_x3, _x4) {
      return _push.apply(this, arguments);
    }

    return push;
  }();

  _proto.replace = function () {
    var _replace = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(data, internal) {
      var location, key, routeState;
      return _regenerator.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);
              key = this._createKey();
              routeState = Object.assign({}, location, {
                action: 'REPLACE',
                key: key
              });
              _context3.next = 5;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 5:
              this.routeState = routeState;
              this.store.dispatch(routeChangeAction(routeState));
              this.nativeLocation = this.locationTransform.out(location);
              this.url = this.nativeLocationToUrl(this.nativeLocation);

              if (internal) {
                this.history.getCurrentInternalHistory().replace(location, key);
              } else {
                this.history.replace(location, key);
              }

              this.nativeRouter.replace(this.url, key, !!internal);
              return _context3.abrupt("return", routeState);

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function replace(_x5, _x6) {
      return _replace.apply(this, arguments);
    }

    return replace;
  }();

  _proto.back = function () {
    var _back = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(n, internal) {
      var stack, uri, _uriToLocation, key, location, routeState;

      return _regenerator.default.wrap(function _callee4$(_context4) {
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
              _uriToLocation = (0, _basic.uriToLocation)(uri), key = _uriToLocation.key, location = _uriToLocation.location;
              routeState = Object.assign({}, location, {
                action: 'BACK',
                key: key
              });
              _context4.next = 9;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 9:
              this.routeState = routeState;
              this.store.dispatch(routeChangeAction(routeState));
              this.nativeLocation = this.locationTransform.out(location);
              this.url = this.nativeLocationToUrl(this.nativeLocation);

              if (internal) {
                this.history.getCurrentInternalHistory().back(n);
              } else {
                this.history.back(n);
              }

              this.nativeRouter.back(this.url, n, key, !!internal);
              return _context4.abrupt("return", routeState);

            case 16:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function back(_x7, _x8) {
      return _back.apply(this, arguments);
    }

    return back;
  }();

  _proto.pop = function () {
    var _pop = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee5(n, internal) {
      var stack, uri, _uriToLocation2, key, location, routeState;

      return _regenerator.default.wrap(function _callee5$(_context5) {
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
              _uriToLocation2 = (0, _basic.uriToLocation)(uri), key = _uriToLocation2.key, location = _uriToLocation2.location;
              routeState = Object.assign({}, location, {
                action: 'POP',
                key: key
              });
              _context5.next = 9;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 9:
              this.routeState = routeState;
              this.store.dispatch(routeChangeAction(routeState));
              this.nativeLocation = this.locationTransform.out(location);
              this.url = this.nativeLocationToUrl(this.nativeLocation);

              if (internal) {
                this.history.getCurrentInternalHistory().pop(n);
              } else {
                this.history.pop(n);
              }

              this.nativeRouter.pop(this.url, n, key, !!internal);
              return _context5.abrupt("return", routeState);

            case 16:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function pop(_x9, _x10) {
      return _pop.apply(this, arguments);
    }

    return pop;
  }();

  return BaseRouter;
}();

exports.BaseRouter = BaseRouter;