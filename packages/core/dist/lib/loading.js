import { MetaData, getModuleActionCreatorList, NSP } from './basic';
import { TaskCounter, TaskCountEvent } from './sprite';
import { ActionTypes } from './actions';
const loadings = {};
let depthTime = 2;
export function setLoadingDepthTime(second) {
  depthTime = second;
}
export function setLoading(item, namespace, group) {
  if (namespace === void 0) {
    namespace = MetaData.appModuleName;
  }

  if (group === void 0) {
    group = 'global';
  }

  if (MetaData.isServer) {
    return item;
  }

  const key = namespace + NSP + group;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(depthTime);
    loadings[key].addListener(TaskCountEvent, e => {
      const store = MetaData.clientStore;

      if (store) {
        const actions = getModuleActionCreatorList(namespace)[ActionTypes.M_LOADING];
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