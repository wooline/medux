import { compose, createStore } from 'redux';
import { env } from '../env';
import { createApp } from '../render';

const reducer = (state, action) => {
  return { ...state,
    ...action.state
  };
};

const createRedux = function (controller, storeOptions) {
  const {
    initState = {},
    enhancers
  } = storeOptions;
  const enhancerList = enhancers ? [...enhancers] : [];

  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancerList.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  const reduxStore = createStore(reducer, initState, enhancerList.length > 1 ? compose(...enhancerList) : enhancerList[0]);
  const {
    dispatch,
    getState
  } = reduxStore;
  reduxStore.dispatch = controller.dispatch;
  controller.setStore({
    getState,

    update(actionName, state, actionData) {
      dispatch({
        type: actionName,
        state,
        payload: actionData
      });
    }

  });
  return reduxStore;
};

export const createAppWithRedux = createApp.bind(null, createRedux);