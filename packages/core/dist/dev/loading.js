"use strict";

exports.__esModule = true;
exports.setLoadingDepthTime = setLoadingDepthTime;
exports.setLoading = setLoading;

var _basic = require("./basic");

var _sprite = require("./sprite");

var _actions2 = require("./actions");

var loadings = {};
var depthTime = 2;

function setLoadingDepthTime(second) {
  depthTime = second;
}

function setLoading(item, moduleName, group) {
  if (moduleName === void 0) {
    moduleName = _basic.MetaData.appModuleName;
  }

  if (group === void 0) {
    group = 'global';
  }

  if (_basic.MetaData.isServer) {
    return item;
  }

  var key = moduleName + _basic.config.NSP + group;

  if (!loadings[key]) {
    loadings[key] = new _sprite.TaskCounter(depthTime);
    loadings[key].addListener(_sprite.TaskCountEvent, function (e) {
      var store = _basic.MetaData.clientStore;

      if (store) {
        var _actions;

        var actions = _basic.MetaData.actionCreatorMap[moduleName][_actions2.ActionTypes.MLoading];
        var action = actions((_actions = {}, _actions[group] = e.data, _actions));
        store.dispatch(action);
      }
    });
  }

  loadings[key].addItem(item);
  return item;
}
//# sourceMappingURL=loading.js.map