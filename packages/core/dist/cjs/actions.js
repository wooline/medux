"use strict";

exports.__esModule = true;
exports.errorAction = errorAction;
exports.routeChangeAction = routeChangeAction;
exports.routeParamsAction = routeParamsAction;
exports.ActionTypes = void 0;

var _basic = require("./basic");

var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteParams: 'RouteParams',
  Error: "medux" + _basic.config.NSP + "Error",
  RouteChange: "medux" + _basic.config.NSP + "RouteChange"
};
exports.ActionTypes = ActionTypes;

function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}

function routeChangeAction(route) {
  return {
    type: ActionTypes.RouteChange,
    payload: [route]
  };
}

function routeParamsAction(moduleName, params) {
  return {
    type: "" + moduleName + _basic.config.NSP + ActionTypes.MRouteParams,
    payload: [params]
  };
}
//# sourceMappingURL=actions.js.map