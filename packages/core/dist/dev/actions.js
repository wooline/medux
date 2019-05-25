"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.errorAction = errorAction;
exports.viewInvalidAction = viewInvalidAction;
exports.ActionTypes = void 0;

var _global = require("./global");

var ActionTypes = {
  M_LOADING: 'LOADING',
  M_INIT: 'INIT',
  F_ERROR: "@@framework".concat(_global.NSP, "ERROR"),
  F_VIEW_INVALID: "@@framework".concat(_global.NSP, "VIEW_INVALID")
};
exports.ActionTypes = ActionTypes;

function errorAction(error) {
  return {
    type: ActionTypes.F_ERROR,
    error: error
  };
}

function viewInvalidAction(currentViews) {
  return {
    type: ActionTypes.F_VIEW_INVALID,
    currentViews: currentViews
  };
}
//# sourceMappingURL=actions.js.map