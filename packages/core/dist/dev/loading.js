import { MetaData, NSP } from './basic';
import { TaskCountEvent, TaskCounter } from './sprite';
import { ActionTypes } from './actions';
var loadings = {};
var depthTime = 2;
export function setLoadingDepthTime(second) {
  depthTime = second;
}
export function setLoading(item, moduleName, group) {
  if (moduleName === void 0) {
    moduleName = MetaData.appModuleName;
  }

  if (group === void 0) {
    group = 'global';
  }

  if (MetaData.isServer) {
    return item;
  }

  var key = moduleName + NSP + group;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, function (e) {
      var store = MetaData.clientStore;

      if (store) {
        var _actions;

        var actions = MetaData.actionCreatorMap[moduleName][ActionTypes.M_LOADING];
        var action = actions((_actions = {}, _actions[group] = e.data, _actions));
        store.dispatch(action);
      }
    });
  }

  loadings[key].addItem(item);
  return item;
}
//# sourceMappingURL=loading.js.map