import {Reducer, compose, createStore, Unsubscribe, StoreEnhancer} from 'redux';
import {env} from './env';
import {BStore} from './basic';
import {StoreBuilder} from './store';

export interface ReduxOptions {
  initState: any;
  enhancers: StoreEnhancer[];
}

export interface ReduxStore extends BStore {
  subscribe(listener: () => void): Unsubscribe;
}

const reduxReducer: Reducer = (state, action) => {
  return {...state, ...action.state};
};

declare const process: any;

export function storeCreator(storeOptions: ReduxOptions): ReduxStore {
  const {initState, enhancers} = storeOptions;
  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }
  const store = createStore(reduxReducer, initState, enhancers.length > 1 ? compose(...enhancers) : enhancers[0]);
  const {dispatch} = store;
  const reduxStore: ReduxStore = store as any;
  reduxStore.update = (actionName: string, state: any, actionData: any[]) => {
    dispatch({type: actionName, state, payload: actionData});
  };
  return reduxStore;
}

export function createRedux(storeOptions: ReduxOptions): StoreBuilder<ReduxOptions, ReduxStore> {
  return {storeOptions, storeCreator};
}
