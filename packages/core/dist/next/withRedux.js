import { compose, createStore } from 'redux';
import { env } from './env';

const reduxReducer = (state, action) => {
  return { ...state,
    ...action.state
  };
};

export function storeCreator(storeOptions) {
  const {
    initState,
    enhancers
  } = storeOptions;

  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  const store = createStore(reduxReducer, initState, enhancers.length > 1 ? compose(...enhancers) : enhancers[0]);
  const {
    dispatch
  } = store;
  const reduxStore = store;

  reduxStore.update = (actionName, state, actionData) => {
    dispatch({
      type: actionName,
      state,
      payload: actionData
    });
  };

  return reduxStore;
}
export function createRedux(storeOptions) {
  return {
    storeOptions,
    storeCreator
  };
}