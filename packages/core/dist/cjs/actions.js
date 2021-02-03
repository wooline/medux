"use strict";

exports.__esModule = true;
exports.errorAction = errorAction;
exports.moduleInitAction = moduleInitAction;
exports.moduleReInitAction = moduleReInitAction;

var _basic = require("./basic");

function errorAction(reason) {
  return {
    type: _basic.ActionTypes.Error,
    payload: [reason]
  };
}

function moduleInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + _basic.config.NSP + _basic.ActionTypes.MInit,
    payload: [initState]
  };
}

function moduleReInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + _basic.config.NSP + _basic.ActionTypes.MReInit,
    payload: [initState]
  };
}