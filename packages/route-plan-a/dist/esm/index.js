import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { CoreModuleHandlers, config, reducer, deepMerge, deepMergeState, mergeState } from '@medux/core';
import { uriToLocation, extractNativeLocation, History } from './basic';
export { createWebLocationTransform } from './transform';
export { PathnameRules, extractPathParams } from './matchPath';
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
export var routeReducer = function routeReducer(state, action) {
  if (action.type === RouteActionTypes.RouteChange) {
    return mergeState(state, action.payload[0]);
  }

  return state;
};
export var BaseRouter = function () {
  function BaseRouter(initLocation, nativeRouter, locationTransform) {
    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "_routeState", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "history", void 0);

    var location = this.locationTransform.in(initLocation);

    var key = this._createKey();

    this.history = new History();
    var routeState = this.locationToRouteState(location, 'RELAUNCH', key);
    this._routeState = routeState;
    this.history.relaunch(location, key);
    var nativeLocation = extractNativeLocation(routeState);
    nativeRouter.relaunch(nativeLocation, key);
  }

  var _proto = BaseRouter.prototype;

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

  _proto.payloadToLocation = function payloadToLocation(data) {
    if (typeof data === 'string') {
      var nativeLocation = this.nativeRouter.parseUrl(data);
      return this.locationTransform.in(nativeLocation);
    }

    var tag = data.tag;
    var extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
    var params = extendParams && data.params ? deepMerge({}, extendParams, data.params) : data.params;
    return {
      tag: tag || this._routeState.tag || '/',
      params: params
    };
  };

  _proto.locationToUrl = function locationToUrl(data) {
    var tag = data.tag;
    var extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
    var params = extendParams && data.params ? deepMerge({}, extendParams, data.params) : data.params;
    var nativeLocation = this.locationTransform.out({
      tag: tag || this._routeState.tag || '/',
      params: params
    });
    return this.nativeRouter.toUrl(nativeLocation);
  };

  _proto.locationToRouteState = function locationToRouteState(location, action, key) {
    var natvieLocation = this.locationTransform.out(location);
    return Object.assign({}, location, {
      action: action,
      key: key
    }, natvieLocation);
  };

  _proto.relaunch = function () {
    var _relaunch = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(data, internal) {
      var paLocation, key, routeState, nativeLocation;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              paLocation = this.payloadToLocation(data);
              key = this._createKey();
              routeState = this.locationToRouteState(paLocation, 'RELAUNCH', key);
              _context.next = 5;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 5:
              this._routeState = routeState;
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().relaunch(paLocation, key);
              } else {
                this.history.relaunch(paLocation, key);
                nativeLocation = extractNativeLocation(routeState);
                this.nativeRouter.relaunch(nativeLocation, key);
              }

              return _context.abrupt("return", routeState);

            case 9:
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
    var _push = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(data, internal) {
      var paLocation, key, routeState, nativeLocation;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              paLocation = this.payloadToLocation(data);
              key = this._createKey();
              routeState = this.locationToRouteState(paLocation, 'PUSH', key);
              _context2.next = 5;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 5:
              this._routeState = routeState;
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().push(paLocation, key);
              } else {
                this.history.push(paLocation, key);
                nativeLocation = extractNativeLocation(routeState);
                this.nativeRouter.push(nativeLocation, key);
              }

              return _context2.abrupt("return", routeState);

            case 9:
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
    var _replace = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(data, internal) {
      var paLocation, key, routeState, nativeLocation;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              paLocation = this.payloadToLocation(data);
              key = this._createKey();
              routeState = this.locationToRouteState(paLocation, 'REPLACE', key);
              _context3.next = 5;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 5:
              this._routeState = routeState;
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().replace(paLocation, key);
              } else {
                this.history.replace(paLocation, key);
                nativeLocation = extractNativeLocation(routeState);
                this.nativeRouter.replace(nativeLocation, key);
              }

              return _context3.abrupt("return", routeState);

            case 9:
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
    var _back = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(n, internal) {
      var stack, uri, _uriToLocation, key, paLocation, routeState, nativeLocation;

      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (n === void 0) {
                n = 1;
              }

              stack = internal ? this.history.getCurrentInternalHistory().getAction(n) : this.history.getAction(n);

              if (stack) {
                _context4.next = 4;
                break;
              }

              return _context4.abrupt("return", Promise.reject(1));

            case 4:
              uri = stack.uri;
              _uriToLocation = uriToLocation(uri), key = _uriToLocation.key, paLocation = _uriToLocation.location;
              routeState = this.locationToRouteState(paLocation, 'BACK', key);
              _context4.next = 9;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 9:
              this._routeState = routeState;
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().back(n);
              } else {
                this.history.back(n);
                nativeLocation = extractNativeLocation(routeState);
                this.nativeRouter.back(nativeLocation, n, key);
              }

              return _context4.abrupt("return", routeState);

            case 13:
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
    var _pop = _asyncToGenerator(_regeneratorRuntime.mark(function _callee5(n, internal) {
      var stack, uri, _uriToLocation2, key, paLocation, routeState, nativeLocation;

      return _regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (n === void 0) {
                n = 1;
              }

              stack = internal ? this.history.getCurrentInternalHistory().getGroup(n) : this.history.getGroup(n);

              if (stack) {
                _context5.next = 4;
                break;
              }

              return _context5.abrupt("return", Promise.reject(1));

            case 4:
              uri = stack.uri;
              _uriToLocation2 = uriToLocation(uri), key = _uriToLocation2.key, paLocation = _uriToLocation2.location;
              routeState = this.locationToRouteState(paLocation, 'POP', key);
              _context5.next = 9;
              return this.store.dispatch(beforeRouteChangeAction(routeState));

            case 9:
              this._routeState = routeState;
              this.store.dispatch(routeChangeAction(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().pop(n);
              } else {
                this.history.pop(n);
                nativeLocation = extractNativeLocation(routeState);
                this.nativeRouter.pop(nativeLocation, n, key);
              }

              return _context5.abrupt("return", routeState);

            case 13:
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