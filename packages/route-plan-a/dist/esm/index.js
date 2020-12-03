import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { CoreModuleHandlers, config, reducer } from '@medux/core';
import assignDeep from './deep-extend';
import { buildHistoryStack, routeConfig, uriToLocation, locationToUri } from './basic';
import { createLocationTransform } from './transform';
export { createLocationTransform } from './transform';
export { setRouteConfig } from './basic';
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
        return routeParams ? Object.assign({}, initState, routeParams) : initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return Object.assign({}, this.state, payload);
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

            if ((_rootState$moduleName = rootState[moduleName]) === null || _rootState$moduleName === void 0 ? void 0 : _rootState$moduleName.initialized) {
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
    return action.payload[0];
  }

  return state;
};
export var BaseHistoryActions = function () {
  function BaseHistoryActions(nativeHistory, locationTransform) {
    this.nativeHistory = nativeHistory;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "_routeState", void 0);

    _defineProperty(this, "_startupUri", void 0);

    _defineProperty(this, "locationTransform", void 0);

    _defineProperty(this, "store", void 0);

    this.locationTransform = locationTransform || createLocationTransform();
    var location = this.locationTransform.in(nativeHistory.getLocation());

    var key = this._createKey();

    var routeState = this.locationToRouteState(location, 'RELAUNCH', key);
    this._routeState = routeState;
    this._startupUri = locationToUri(location, key);
    nativeHistory.relaunch(this.locationTransform.out(location), key);
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
      return uri.startsWith("" + key + routeConfig.RSP);
    });
  };

  _proto.payloadToLocation = function payloadToLocation(data) {
    if (typeof data === 'string') {
      var nativeLocation = this.nativeHistory.parseUrl(data);
      return this.locationTransform.in(nativeLocation);
    }

    var _data$tag = data.tag,
        tag = _data$tag === void 0 ? '/' : _data$tag,
        extendParams = data.extendParams;
    var params = assignDeep({}, extendParams === true ? this._routeState.params : extendParams, data.params);
    return {
      tag: tag,
      params: params
    };
  };

  _proto.locationToUrl = function locationToUrl(data) {
    var _data$tag2 = data.tag,
        tag = _data$tag2 === void 0 ? '' : _data$tag2,
        extendParams = data.extendParams;
    var params = assignDeep({}, extendParams === true ? this._routeState.params : extendParams, data.params);
    var nativeLocation = this.locationTransform.out({
      tag: tag,
      params: params
    });
    return this.nativeHistory.toUrl(nativeLocation);
  };

  _proto.locationToRouteState = function locationToRouteState(location, action, key) {
    var _buildHistoryStack = buildHistoryStack(location, action, key, this._routeState || {
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
    var _dispatch = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(location, action, key, callNative) {
      var routeState, nativeLocation;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
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
                nativeLocation = this.locationTransform.out(location);

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
        uri = routeConfig.homeUri;
      } else if (root === 'FIRST') {
        uri = this._startupUri;
      } else {
        return Promise.reject(1);
      }
    }

    var _uriToLocation = uriToLocation(uri),
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

    return this.relaunch(root === 'HOME' ? routeConfig.homeUri : this._startupUri, disableNative);
  };

  return BaseHistoryActions;
}();