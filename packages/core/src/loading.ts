import {MetaData, getModuleActionCreatorList, NSP} from './global';
import {TaskCounter, TaskCountEvent} from './sprite';
import {ActionTypes} from './actions';

const loadings: {[namespace: string]: TaskCounter} = {};

let depthTime = 2;

export function setLoadingDepthTime(second: number) {
  depthTime = second;
}
export function setLoading<T extends Promise<any>>(item: T, namespace: string = MetaData.appModuleName, group: string = 'global'): T {
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
        const action = actions({[group]: e.data});
        store.dispatch(action);
      }
    });
  }
  loadings[key].addItem(item);
  return item;
}
