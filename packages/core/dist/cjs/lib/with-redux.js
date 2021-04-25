"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createAppWithRedux = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _redux = require("redux");

var _env = require("../env");

var _render = require("../render");

var reducer = function reducer(state, action) {
  return (0, _extends2.default)({}, state, action.state);
};

var createRedux = function createRedux(controller, storeOptions) {
  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      enhancers = storeOptions.enhancers;
  var enhancerList = enhancers ? [].concat(enhancers) : [];

  if (process.env.NODE_ENV === 'development' && _env.env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancerList.push(_env.env.__REDUX_DEVTOOLS_EXTENSION__(_env.env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  var reduxStore = (0, _redux.createStore)(reducer, initState, enhancerList.length > 1 ? _redux.compose.apply(void 0, enhancerList) : enhancerList[0]);
  var dispatch = reduxStore.dispatch,
      getState = reduxStore.getState;
  reduxStore.dispatch = controller.dispatch;
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

var createAppWithRedux = _render.createApp.bind(null, createRedux);

exports.createAppWithRedux = createAppWithRedux;