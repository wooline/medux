import { ActionTypes, MetaData, cacheModule, config, isProcessedError, isPromise, setProcessedError } from './basic';
import { applyMiddleware, compose, createStore } from 'redux';
import { client, isDevelopmentEnv, isServerEnv } from './env';
import { errorAction, routeChangeAction, routeParamsAction } from './actions';

function isPromiseModule(module) {
  return typeof module['then'] === 'function';
}

export function loadModel(moduleName, storeInstance, options) {
  var store = storeInstance || MetaData.clientStore;
  var hasInjected = !!store._medux_.injectedModules[moduleName];

  if (!hasInjected) {
    var moduleGetter = MetaData.moduleGetter;
    var result = moduleGetter[moduleName]();

    if (isPromiseModule(result)) {
      return result.then(function (module) {
        cacheModule(module);
        return module.default.model(store, options);
      });
    } else {
      cacheModule(result);
      return result.default.model(store, options);
    }
  }
}
export function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
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
      store.dispatch(routeChangeAction({
        location: location,
        data: data
      }));
    } else {
      inTimeTravelling = false;
    }
  };

  store._medux_.destroy = history.subscribe(handleLocationChange);
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

export function buildStore(history, preloadedState, storeReducers, storeMiddlewares, storeEnhancers) {
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

  if (MetaData.clientStore) {
    MetaData.clientStore._medux_.destroy();
  }

  if (storeReducers.route) {
    throw new Error("the reducer name 'route' is not allowed");
  }

  storeReducers.route = function (state, action) {
    if (action.type === ActionTypes.RouteChange) {
      var payload = getActionData(action)[0];

      if (!state) {
        return payload;
      }

      return Object.assign({}, state, {}, payload);
    }

    return state;
  };

  var combineReducers = function combineReducers(rootState, action) {
    if (!store) {
      return rootState;
    }

    var meta = store._medux_;
    meta.prevState = rootState;
    meta.currentState = rootState;
    Object.keys(storeReducers).forEach(function (moduleName) {
      var result = storeReducers[moduleName](rootState[moduleName], action);

      if (result !== rootState[moduleName]) {
        var _Object$assign;

        meta.currentState = Object.assign({}, meta.currentState, (_Object$assign = {}, _Object$assign[moduleName] = result, _Object$assign));
      }
    });
    var handlersCommon = meta.reducerMap[action.type] || {};
    var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};
    var handlers = Object.assign({}, handlersCommon, {}, handlersEvery);
    var handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      var orderList = [];
      var priority = action.priority ? [].concat(action.priority) : [];
      handlerModules.forEach(function (moduleName) {
        var fun = handlers[moduleName];

        if (moduleName === MetaData.appModuleName) {
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
          var result = fun.apply(void 0, getActionData(action));

          if (result !== rootState[moduleName]) {
            var _Object$assign2;

            meta.currentState = Object.assign({}, meta.currentState, (_Object$assign2 = {}, _Object$assign2[moduleName] = result, _Object$assign2));
          }
        }
      });
    }

    var changed = Object.keys(rootState).length !== Object.keys(meta.currentState).length || Object.keys(rootState).some(function (moduleName) {
      return rootState[moduleName] !== meta.currentState[moduleName];
    });
    meta.prevState = changed ? meta.currentState : rootState;
    return meta.prevState;
  };

  var middleware = function middleware(_ref2) {
    var dispatch = _ref2.dispatch;
    return function (next) {
      return function (originalAction) {
        if (isServerEnv) {
          if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
            return originalAction;
          }
        }

        var meta = store._medux_;
        meta.beforeState = meta.prevState;
        var action = next(originalAction);

        if (action.type === ActionTypes.RouteChange) {
          var rootRouteParams = meta.prevState.route.data.params;
          Object.keys(rootRouteParams).forEach(function (moduleName) {
            var routeParams = rootRouteParams[moduleName];

            if (routeParams && Object.keys(routeParams).length > 0 && meta.injectedModules[moduleName]) {
              dispatch(routeParamsAction(moduleName, routeParams));
            }
          });
        }

        var handlersCommon = meta.effectMap[action.type] || {};
        var handlersEvery = meta.effectMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};
        var handlers = Object.assign({}, handlersCommon, {}, handlersEvery);
        var handlerModules = Object.keys(handlers);

        if (handlerModules.length > 0) {
          var orderList = [];
          var priority = action.priority ? [].concat(action.priority) : [];
          handlerModules.forEach(function (moduleName) {
            var fun = handlers[moduleName];

            if (moduleName === MetaData.appModuleName) {
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
              var effectResult = fun.apply(void 0, getActionData(action));
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

                if (action.type === ActionTypes.Error) {
                  if (isProcessedError(error) === undefined) {
                    error = setProcessedError(error, true);
                  }

                  throw error;
                } else if (isProcessedError(error)) {
                  throw error;
                } else {
                  return dispatch(errorAction(error));
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
        var _action$type$split = action.type.split(config.NSP),
            moduleName = _action$type$split[0],
            actionName = _action$type$split[1];

        if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
          var initModel = loadModel(moduleName, store, undefined);

          if (isPromise(initModel)) {
            return initModel.then(function () {
              return next(action);
            });
          }
        }

        return next(action);
      };
    };
  };

  var middlewareEnhancer = applyMiddleware.apply(void 0, [preLoadMiddleware].concat(storeMiddlewares, [middleware]));

  var enhancer = function enhancer(newCreateStore) {
    return function () {
      var newStore = newCreateStore.apply(void 0, arguments);
      var modelStore = newStore;
      modelStore._medux_ = {
        beforeState: {},
        prevState: {},
        currentState: {},
        reducerMap: {},
        effectMap: {},
        injectedModules: {},
        destroy: function destroy() {
          return void 0;
        }
      };
      return newStore;
    };
  };

  var enhancers = [middlewareEnhancer, enhancer].concat(storeEnhancers);

  if (isDevelopmentEnv && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  var store = createStore(combineReducers, preloadedState, compose.apply(void 0, enhancers));
  bindHistory(store, history);

  if (!isServerEnv) {
    MetaData.clientStore = store;
  }

  return store;
}