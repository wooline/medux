"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getActionData = getActionData;
exports.buildStore = buildStore;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _basic = require("./basic");

var _actions = require("./actions");

var _redux = require("redux");

var _module = require("./module");

function getActionData(action) {
  var arr = Object.keys(action).filter(function (key) {
    return key !== 'type' && key !== 'priority' && key !== 'time';
  });

  if (arr.length === 0) {
    return undefined;
  } else if (arr.length === 1) {
    return action[arr[0]];
  } else {
    var data = (0, _objectSpread2.default)({}, action);
    delete data['type'];
    delete data['priority'];
    delete data['time'];
    return data;
  }
}

function bindHistory(store, history) {
  var inTimeTravelling = false;

  var handleLocationChange = function handleLocationChange(location) {
    if (!inTimeTravelling) {
      var _ref = store.getState(),
          route = _ref.route;

      if (route) {
        if (history.equal(route.location, location)) {
          return;
        }
      }

      var data = history.locationToRouteData(location);
      store.dispatch((0, _actions.routeChangeAction)({
        location: location,
        data: data
      }));
    } else {
      inTimeTravelling = false;
    }
  };

  history.subscribe(handleLocationChange);
  store.subscribe(function () {
    if (history.initialized) {
      var storeRouteState = store.getState().route;

      if (!history.equal(storeRouteState.location, history.getLocation())) {
        inTimeTravelling = true;
        history.patch(storeRouteState.location, storeRouteState.data);
      }
    }
  });
  history.initialized && handleLocationChange(history.getLocation());
}

function buildStore(history, preloadedState, storeReducers, storeMiddlewares, storeEnhancers) {
  if (preloadedState === void 0) {
    preloadedState = {};
  }

  if (storeReducers === void 0) {
    storeReducers = {};
  }

  if (storeMiddlewares === void 0) {
    storeMiddlewares = [];
  }

  if (storeEnhancers === void 0) {
    storeEnhancers = [];
  }

  if (storeReducers.route) {
    throw new Error("the reducer name 'route' is not allowed");
  }

  storeReducers.route = function (state, action) {
    if (action.type === _actions.ActionTypes.RouteChange) {
      var payload = getActionData(action);

      if (!state) {
        return payload;
      }

      return (0, _objectSpread2.default)({}, state, payload);
    }

    return state;
  };

  var store;

  var combineReducers = function combineReducers(rootState, action) {
    if (!store) {
      return rootState;
    }

    var meta = store._medux_;
    meta.prevState = rootState;
    var currentState = (0, _objectSpread2.default)({}, rootState);
    meta.currentState = currentState;
    Object.keys(storeReducers).forEach(function (moduleName) {
      currentState[moduleName] = storeReducers[moduleName](currentState[moduleName], action);
    });
    var handlersCommon = meta.reducerMap[action.type] || {}; // 支持泛监听，形如 */loading

    var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + _basic.config.NSP + "]+"), '*')] || {};
    var handlers = (0, _objectSpread2.default)({}, handlersCommon, handlersEvery);
    var handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      var orderList = [];
      var priority = action.priority ? [].concat(action.priority) : [];
      handlerModules.forEach(function (moduleName) {
        var fun = handlers[moduleName];

        if (moduleName === _basic.MetaData.appModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }

        if (!fun.__isHandler__) {
          priority.unshift(moduleName);
        }
      });
      orderList.unshift.apply(orderList, priority);
      var moduleNameMap = {};
      orderList.forEach(function (moduleName) {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          var fun = handlers[moduleName];
          currentState[moduleName] = fun(getActionData(action));
        }
      });
    }

    var changed = Object.keys(rootState).length !== Object.keys(currentState).length || Object.keys(rootState).some(function (moduleName) {
      return rootState[moduleName] !== currentState[moduleName];
    });
    meta.prevState = changed ? currentState : rootState;
    return meta.prevState;
  };

  var middleware = function middleware(_ref2) {
    var dispatch = _ref2.dispatch;
    return function (next) {
      return function (originalAction) {
        if (_basic.MetaData.isServer) {
          if (originalAction.type.split(_basic.config.NSP)[1] === _actions.ActionTypes.MLoading) {
            return originalAction;
          }
        }

        var prevState = store._medux_.prevState;
        var action = next(originalAction);

        if (action.type === _actions.ActionTypes.RouteChange) {
          var rootRouteParams = store._medux_.prevState.route.data.params;
          Object.keys(rootRouteParams).forEach(function (moduleName) {
            var preRouteParams = rootRouteParams[moduleName];

            if (preRouteParams && Object.keys(preRouteParams).length > 0 && store._medux_.injectedModules[moduleName]) {
              dispatch((0, _actions.preRouteParamsAction)(moduleName, preRouteParams));
            }
          });
        }

        var handlersCommon = store._medux_.effectMap[action.type] || {}; // 支持泛监听，形如 */loading

        var handlersEvery = store._medux_.effectMap[action.type.replace(new RegExp("[^" + _basic.config.NSP + "]+"), '*')] || {};
        var handlers = (0, _objectSpread2.default)({}, handlersCommon, handlersEvery);
        var handlerModules = Object.keys(handlers);

        if (handlerModules.length > 0) {
          var orderList = [];
          var priority = action.priority ? [].concat(action.priority) : [];
          handlerModules.forEach(function (moduleName) {
            var fun = handlers[moduleName];

            if (moduleName === _basic.MetaData.appModuleName) {
              orderList.unshift(moduleName);
            } else {
              orderList.push(moduleName);
            }

            if (!fun.__isHandler__) {
              priority.unshift(moduleName);
            }
          });
          orderList.unshift.apply(orderList, priority);
          var moduleNameMap = {};
          var promiseResults = [];
          orderList.forEach(function (moduleName) {
            if (!moduleNameMap[moduleName]) {
              moduleNameMap[moduleName] = true;
              var fun = handlers[moduleName];
              var effectResult = fun(getActionData(action), prevState);
              var decorators = fun.__decorators__;

              if (decorators) {
                var results = [];
                decorators.forEach(function (decorator, index) {
                  results[index] = decorator[0](action, moduleName, effectResult);
                });
                fun.__decoratorResults__ = results;
              }

              var errorHandler = effectResult.then(function (reslove) {
                if (decorators) {
                  var _results = fun.__decoratorResults__ || [];

                  decorators.forEach(function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Resolved', _results[index], reslove);
                    }
                  });
                  fun.__decoratorResults__ = undefined;
                }

                return reslove;
              }, function (error) {
                if (decorators) {
                  var _results2 = fun.__decoratorResults__ || [];

                  decorators.forEach(function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Rejected', _results2[index], error);
                    }
                  });
                  fun.__decoratorResults__ = undefined;
                }

                if (action.type === _actions.ActionTypes.Error) {
                  if ((0, _basic.isProcessedError)(error) === undefined) {
                    error = (0, _basic.setProcessedError)(error, true);
                  }

                  throw error;
                } else if ((0, _basic.isProcessedError)(error)) {
                  throw error;
                } else {
                  return dispatch((0, _actions.errorAction)(error));
                }
              });
              promiseResults.push(errorHandler);
            }
          });

          if (promiseResults.length) {
            return Promise.all(promiseResults);
          }
        }

        return action;
      };
    };
  };

  var preLoadMiddleware = function preLoadMiddleware() {
    return function (next) {
      return function (action) {
        var _action$type$split = action.type.split(_basic.config.NSP),
            moduleName = _action$type$split[0],
            actionName = _action$type$split[1];

        if (moduleName && actionName && _basic.MetaData.moduleGetter[moduleName]) {
          var initModel = (0, _module.injectModel)(_basic.MetaData.moduleGetter, moduleName, store);

          if ((0, _basic.isPromise)(initModel)) {
            return initModel.then(function () {
              return next(action);
            });
          }
        }

        return next(action);
      };
    };
  };

  var middlewareEnhancer = _redux.applyMiddleware.apply(void 0, [preLoadMiddleware].concat(storeMiddlewares, [middleware]));

  var enhancer = function enhancer(newCreateStore) {
    return function () {
      var newStore = newCreateStore.apply(void 0, arguments);
      var modelStore = newStore;
      modelStore._medux_ = {
        prevState: {},
        currentState: {},
        reducerMap: {},
        effectMap: {},
        injectedModules: {},
        currentViews: {}
      };
      return newStore;
    };
  };

  var enhancers = [].concat(storeEnhancers, [middlewareEnhancer, enhancer]);

  if (_basic.MetaData.isDev && _basic.client && _basic.client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(_basic.client.__REDUX_DEVTOOLS_EXTENSION__(_basic.client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  store = (0, _redux.createStore)(combineReducers, preloadedState, _redux.compose.apply(void 0, enhancers));
  bindHistory(store, history);
  _basic.MetaData.clientStore = store;
  return store;
}
//# sourceMappingURL=store.js.map