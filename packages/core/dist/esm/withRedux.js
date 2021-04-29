import _extends from "@babel/runtime/helpers/esm/extends";
import { compose, createStore } from 'redux';
import { env } from './env';

var reduxReducer = function reduxReducer(state, action) {
  return _extends({}, state, action.state);
};

export function storeCreator(storeOptions) {
  var initState = storeOptions.initState,
      enhancers = storeOptions.enhancers;

  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  var store = createStore(reduxReducer, initState, enhancers.length > 1 ? compose.apply(void 0, enhancers) : enhancers[0]);
  var dispatch = store.dispatch;
  var reduxStore = store;

  reduxStore.update = function (actionName, state, actionData) {
    dispatch({
      type: actionName,
      state: state,
      payload: actionData
    });
  };

  return reduxStore;
}
export function createRedux(storeOptions) {
  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}