"use strict";

exports.__esModule = true;
exports.errorAction = errorAction;
exports.routeChangeAction = routeChangeAction;
exports.routeParamsAction = routeParamsAction;

var _basic = require("./basic");

function errorAction(error) {
  return {
    type: _basic.ActionTypes.Error,
    payload: [error]
  };
}

function routeChangeAction(route) {
  return {
    type: _basic.ActionTypes.RouteChange,
    payload: [route]
  };
}

function routeParamsAction(moduleName, params) {
  return {
    type: "" + moduleName + _basic.config.NSP + _basic.ActionTypes.MRouteParams,
    payload: [params]
  };
}