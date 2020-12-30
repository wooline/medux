"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.beforeRouteChangeAction = beforeRouteChangeAction;
exports.routeParamsAction = routeParamsAction;
exports.routeChangeAction = routeChangeAction;
exports.BaseHistoryActions = exports.routeReducer = exports.routeMiddleware = exports.RouteActionTypes = exports.RouteModuleHandlers = exports.setRouteConfig = exports.extractPathParams = exports.PathnameRules = exports.createWebLocationTransform = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _core = require("@medux/core");

var _basic = require("./basic");

exports.setRouteConfig = _basic.setRouteConfig;

var _transform = require("./transform");

exports.createWebLocationTransform = _transform.createWebLocationTransform;

var _matchPath = require("./matchPath");

exports.PathnameRules = _matchPath.PathnameRules;
exports.extractPathParams = _matchPath.extractPathParams;
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

var BaseHistoryActions = function () {
  function BaseHistoryActions(nativeHistory, locationTransform) {
    this.nativeHistory = nativeHistory;
    this.locationTransform = locationTransform;
    (0, _defineProperty2.default)(this, "_tid", 0);
    (0, _defineProperty2.default)(this, "_routeState", void 0);
    (0, _defineProperty2.default)(this, "_startupUri", void 0);
    (0, _defineProperty2.default)(this, "store", void 0);
    var location = this.locationTransform.in(nativeHistory.getLocation());

    var key = this._createKey();

    var routeState = this.locationToRouteState(location, 'RELAUNCH', key);
    this._routeState = routeState;
    this._startupUri = (0, _basic.locationToUri)(location, key);
    var nativeLocation = (0, _basic.extractNativeLocation)(routeState);
    nativeHistory.relaunch(nativeLocation, key);
  }

  var _proto = BaseHistoryActions.prototype;

  _proto.getRouteState = function getRouteState() {
    return this._routeState;
  };

  _proto.setStore = function setStore(_store) {
    this.store = _store;
  };

  _proto.getCurKey = function getCurKey() {
    return this._routeState.key;
  };

  _proto._createKey = function _createKey() {
    this._tid++;
    return "" + this._tid;
  };

  _proto.findHistoryByKey = function findHistoryByKey(key) {
    var history = this._routeState.history;
    return history.findIndex(function (uri) {
      return uri.startsWith("" + key + _basic.routeConfig.RSP);
    });
  };

  _proto.payloadToLocation = function payloadToLocation(data) {
    if (typeof data === 'string') {
      var nativeLocation = this.nativeHistory.parseUrl(data);
      return this.locationTransform.in(nativeLocation);
    }

    var tag = data.tag;
    var extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
    var params = extendParams && data.params ? (0, _core.deepMerge)({}, extendParams, data.params) : data.params;
    return {
      tag: tag || this._routeState.tag || '/',
      params: params
    };
  };

  _proto.locationToUrl = function locationToUrl(data) {
    var tag = data.tag;
    var extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
    var params = extendParams && data.params ? (0, _core.deepMerge)({}, extendParams, data.params) : data.params;
    var nativeLocation = this.locationTransform.out({
      tag: tag || this._routeState.tag || '/',
      params: params
    });
    return this.nativeHistory.toUrl(nativeLocation);
  };

  _proto.locationToRouteState = function locationToRouteState(location, action, key) {
    var _buildHistoryStack = (0, _basic.buildHistoryStack)(location, action, key, this._routeState || {
      history: [],
      stack: []
    }),
        history = _buildHistoryStack.history,
        stack = _buildHistoryStack.stack;

    var natvieLocation = this.locationTransform.out(location);
    return Object.assign({}, location, {
      action: action,
      key: key,
      history: history,
      stack: stack
    }, natvieLocation);
  };

  _proto.dispatch = function () {
    var _dispatch = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(location, action, key, callNative) {
      var routeState, nativeLocation;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (key === void 0) {
                key = '';
              }

              key = key || this._createKey();
              routeState = this.locationToRouteState(location, action, key);
              _context.next = 5;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 5:
              this._routeState = routeState;
              _context.next = 8;
              return this.store.dispatch(routeChangeAction(routeState));

            case 8:
              if (callNative) {
                nativeLocation = (0, _basic.extractNativeLocation)(routeState);

                if (typeof callNative === 'number') {
                  this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative, key);
                } else {
                  this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation, key);
                }
              }

              return _context.abrupt("return", routeState);

            case 10:
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

  _proto.pop = function pop(n, root, disableNative, useStack) {
    if (n === void 0) {
      n = 1;
    }

    if (root === void 0) {
      root = 'FIRST';
    }

    n = n || 1;
    var uri = useStack ? this._routeState.stack[n] : this._routeState.history[n];
    var k = useStack ? 1000 + n : n;

    if (!uri) {
      k = 1000000;

      if (root === 'HOME') {
        uri = _basic.routeConfig.homeUri;
      } else if (root === 'FIRST') {
        uri = this._startupUri;
      } else {
        return Promise.reject(1);
      }
    }

    var _uriToLocation = (0, _basic.uriToLocation)(uri),
        key = _uriToLocation.key,
        location = _uriToLocation.location;

    return this.dispatch(location, "POP" + k, key, disableNative ? '' : k);
  };

  _proto.back = function back(n, root, disableNative) {
    if (n === void 0) {
      n = 1;
    }

    if (root === void 0) {
      root = 'FIRST';
    }

    return this.pop(n, root, disableNative, true);
  };

  _proto.home = function home(root, disableNative) {
    if (root === void 0) {
      root = 'FIRST';
    }

    return this.relaunch(root === 'HOME' ? _basic.routeConfig.homeUri : this._startupUri, disableNative);
  };

  return BaseHistoryActions;
}();

exports.BaseHistoryActions = BaseHistoryActions;