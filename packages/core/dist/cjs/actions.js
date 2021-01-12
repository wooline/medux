"use strict";

exports.__esModule = true;
exports.errorAction = errorAction;
exports.moduleInitAction = moduleInitAction;

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