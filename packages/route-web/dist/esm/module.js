import _createClass from "@babel/runtime/helpers/esm/createClass";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { CoreModuleHandlers, config, reducer, deepMerge, mergeState, deepMergeState } from '@medux/core';
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
        return routeParams ? deepMerge({}, initState, routeParams) : initState;
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
  RouteChange: "route" + config.NSP + "RouteChange",
  TestRouteChange: "route" + config.NSP + "TestRouteChange"
};
export function testRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.TestRouteChange,
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
        var result = next(action);
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
        return result;
      }

      return next(action);
    };
  };
};
export var RouteHandlers = function () {
  function RouteHandlers() {
    _defineProperty(this, "initState", void 0);

    _defineProperty(this, "moduleName", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "actions", void 0);
  }

  var _proto = RouteHandlers.prototype;

  _proto.RouteChange = function RouteChange(routeState) {
    return mergeState(this.state, routeState);
  };

  _createClass(RouteHandlers, [{
    key: "state",
    get: function get() {
      return this.store.getState(this.moduleName);
    }
  }]);

  return RouteHandlers;
}();