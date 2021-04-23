import _extends from "@babel/runtime/helpers/esm/extends";
import { compose, createStore, applyMiddleware } from 'redux';
import { env } from '../env';
import { createApp } from '../render';

var reducer = function reducer(state, action) {
  return _extends({}, state, action.state);
};

var createRedux = function createRedux(controller, storeOptions) {
  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      middlewares = storeOptions.middlewares,
      enhancers = storeOptions.enhancers;
  var enhancerList = enhancers ? [].concat(enhancers) : [];

  if (middlewares) {
    enhancerList.push(applyMiddleware.apply(void 0, middlewares));
  }

  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancerList.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  var reduxStore = createStore(reducer, initState, enhancerList.length > 1 ? compose.apply(void 0, enhancerList) : enhancerList[0]);
  var dispatch = reduxStore.dispatch,
      getState = reduxStore.getState;
  reduxStore.dispatch = controller.dispatch.bind(controller);
  controller.setStore({
    getState: getState,
    update: function update(actionName, state, actionData) {
      dispatch({
        type: actionName,
        state: state,
        payload: actionData
      });
    }
  });
  return reduxStore;
};

export var createAppWithRedux = createApp.bind(null, createRedux);