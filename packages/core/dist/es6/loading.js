import { MetaData, config } from './basic';
import { TaskCountEvent, TaskCounter } from './sprite';
import { ActionTypes } from './actions';
const loadings = {};
let depthTime = 2;
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

  const key = moduleName + config.NSP + group;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, e => {
      const store = MetaData.clientStore;

      if (store) {
        const actions = MetaData.actionCreatorMap[moduleName][ActionTypes.MLoading];
        const action = actions({
          [group]: e.data
        });
        store.dispatch(action);
      }
    });
  }

  loadings[key].addItem(item);
  return item;
}
//# sourceMappingURL=loading.js.map