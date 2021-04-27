"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createRedux = createRedux;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _redux = require("redux");

var _env = require("../env");

var reducer = function reducer(state, action) {
  return (0, _extends2.default)({}, state, action.state);
};

function createRedux(storeOptions) {
  var initState = storeOptions.initState,
      enhancers = storeOptions.enhancers;

  if (process.env.NODE_ENV === 'development' && _env.env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(_env.env.__REDUX_DEVTOOLS_EXTENSION__(_env.env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  var store = (0, _redux.createStore)(reducer, initState, enhancers.length > 1 ? _redux.compose.apply(void 0, enhancers) : enhancers[0]);
  var dispatch = store.dispatch,
      _getState = store.getState,
      subscribe = store.subscribe;
  var reduxStore = {
    subscribe: subscribe,
    dispatch: dispatch,
    getState: function getState(moduleName) {
      var state = _getState();

      return moduleName ? state[moduleName] : state;
    },
    update: function update(actionName, state, actionData) {
      dispatch({
        type: actionName,
        state: state,
        payload: actionData
      });
    }
  };
  return reduxStore;
}