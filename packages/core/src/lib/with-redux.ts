import {Reducer, compose, createStore, Unsubscribe, StoreEnhancer} from 'redux';
import {env} from '../env';
import {State} from '../basic';
import {BaseStore, BaseStoreOptions} from '../render';

export interface ReduxOptions extends BaseStoreOptions {
  enhancers: StoreEnhancer[];
}

export interface ReduxStore<S extends State = {}> extends BaseStore<S> {
  subscribe(listener: () => void): Unsubscribe;
}

const reducer: Reducer = (state, action) => {
  return {...state, ...action.state};
};

declare const process: any;

export function createRedux<S extends State = {}>(storeOptions: ReduxOptions): ReduxStore<S> {
  const {initState, enhancers} = storeOptions;
  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }
  const store = createStore(reducer, initState, enhancers.length > 1 ? compose(...enhancers) : enhancers[0]);
  const {dispatch, getState, subscribe} = store;
  const reduxStore: ReduxStore<S> = {
    subscribe,
    dispatch: dispatch as any,
    getState(moduleName?: string) {
      const state = getState();
      return moduleName ? state[moduleName] : state;
    },
    update(actionName: string, state: Partial<S>, actionData: any[]) {
      dispatch({type: actionName, state, payload: actionData});
    },
  };
  return reduxStore;
}
