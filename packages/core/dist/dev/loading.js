"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.setLoadingDepthTime = setLoadingDepthTime;
exports.setLoading = setLoading;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));

var _global = require("./global");

var _sprite = require("./sprite");

var _actions2 = require("./actions");

var loadings = {};
var depthTime = 2;

function setLoadingDepthTime(second) {
  depthTime = second;
}

function setLoading(item) {
  var namespace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _global.MetaData.appModuleName;
  var group = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'global';

  if (_global.MetaData.isServer) {
    return item;
  }

  var key = namespace + _global.NSP + group;

  if (!loadings[key]) {
    loadings[key] = new _sprite.TaskCounter(depthTime);
    loadings[key].addListener(_sprite.TaskCountEvent, function (e) {
      var store = _global.MetaData.clientStore;

      if (store) {
        var actions = (0, _global.getModuleActionCreatorList)(namespace)[_actions2.ActionTypes.M_LOADING];

        var action = actions((0, _defineProperty2.default)({}, group, e.data));
        store.dispatch(action);
      }
    });
  }

  loadings[key].addItem(item);
  return item;
}
//# sourceMappingURL=loading.js.map