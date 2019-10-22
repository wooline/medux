"use strict";

exports.__esModule = true;
exports.errorAction = errorAction;
exports.routeChangeAction = routeChangeAction;
exports.preRouteParamsAction = preRouteParamsAction;
exports.ActionTypes = void 0;

var _basic = require("./basic");

var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MPreRouteParams: 'PreRouteParams',
  Error: "medux" + _basic.config.NSP + "Error",
  RouteChange: "medux" + _basic.config.NSP + "RouteChange"
};
exports.ActionTypes = ActionTypes;

function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: error
  };
}

function routeChangeAction(route) {
  return {
    type: ActionTypes.RouteChange,
    payload: route
  };
}

function preRouteParamsAction(moduleName, params) {
  return {
    type: "" + moduleName + _basic.config.NSP + ActionTypes.MPreRouteParams,
    payload: params
  };
}
//# sourceMappingURL=actions.js.map