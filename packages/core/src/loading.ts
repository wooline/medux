import {MetaData, config} from './basic';
import {TaskCountEvent, TaskCounter} from './sprite';

import {ActionTypes} from './actions';

const loadings: {[moduleName: string]: TaskCounter} = {};

let depthTime = 2;

export function setLoadingDepthTime(second: number) {
  depthTime = second;
}
export function setLoading<T extends Promise<any>>(item: T, moduleName: string = MetaData.appModuleName, group: string = 'global'): T {
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
        const action = actions({[group]: e.data});
        store.dispatch(action);
      }
    });
  }
  loadings[key].addItem(item);
  return item;
}
