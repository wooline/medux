import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

import { MetaData, client, config, isProcessedError, isPromise, setProcessedError } from './basic';
import { ActionTypes, errorAction, preRouteParamsAction, routeChangeAction } from './actions';
import { applyMiddleware, compose, createStore } from 'redux';
import { loadModel } from './module';
export function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : []; // const arr = Object.keys(action).filter(key => key !== 'type' && key !== 'priority' && key !== 'time');
  // if (arr.length === 0) {
  //   return undefined as any;
  // } else if (arr.length === 1) {
  //   return action[arr[0]];
  // } else {
  //   const data = {...action};
  //   delete data['type'];
  //   delete data['priority'];
  //   delete data['time'];
  //   return data as any;
  // }
}

function bindHistory(store, history) {
  var inTimeTravelling = false;

  var handleLocationChange = location => {
    if (!inTimeTravelling) {
      var {
        route
      } = store.getState();

      if (route) {
        if (history.equal(route.location, location)) {
          return;
        }
      }

      var data = history.locationToRouteData(location);
      store.dispatch(routeChangeAction({
        location,
        data
      }));
    } else {
      inTimeTravelling = false;
    }
  };

  history.subscribe(handleLocationChange);
  store.subscribe(() => {
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

  if (storeReducers.route) {
    throw new Error("the reducer name 'route' is not allowed");
  }

  storeReducers.route = (state, action) => {
    if (action.type === ActionTypes.RouteChange) {
      var payload = getActionData(action)[0];

      if (!state) {
        return payload;
      }

      return _objectSpread({}, state, {}, payload);
    }

    return state;
  };

  var combineReducers = (rootState, action) => {
    if (!store) {
      return rootState;
    }

    var meta = store._medux_;
    meta.prevState = rootState;

    var currentState = _objectSpread({}, rootState);

    meta.currentState = currentState;
    Object.keys(storeReducers).forEach(moduleName => {
      currentState[moduleName] = storeReducers[moduleName](currentState[moduleName], action);
    });
    var handlersCommon = meta.reducerMap[action.type] || {}; // 支持泛监听，形如 */loading

    var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};

    var handlers = _objectSpread({}, handlersCommon, {}, handlersEvery);

    var handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      var orderList = [];
      var priority = action.priority ? [...action.priority] : [];
      handlerModules.forEach(moduleName => {
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
      orderList.unshift(...priority);
      var moduleNameMap = {};
      orderList.forEach(moduleName => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          var fun = handlers[moduleName];
          currentState[moduleName] = fun(...getActionData(action));
        }
      });
    }

    var changed = Object.keys(rootState).length !== Object.keys(currentState).length || Object.keys(rootState).some(moduleName => rootState[moduleName] !== currentState[moduleName]);
    meta.prevState = changed ? currentState : rootState;
    return meta.prevState;
  };

  var middleware = (_ref) => {
    var {
      dispatch
    } = _ref;
    return next => originalAction => {
      if (MetaData.isServer) {
        if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
          return originalAction;
        }
      }

      var prevState = store._medux_.prevState;
      var action = next(originalAction);

      if (action.type === ActionTypes.RouteChange) {
        var rootRouteParams = store._medux_.prevState.route.data.params;
        Object.keys(rootRouteParams).forEach(moduleName => {
          var preRouteParams = rootRouteParams[moduleName];

          if (preRouteParams && Object.keys(preRouteParams).length > 0 && store._medux_.injectedModules[moduleName]) {
            dispatch(preRouteParamsAction(moduleName, preRouteParams));
          }
        });
      }

      var handlersCommon = store._medux_.effectMap[action.type] || {}; // 支持泛监听，形如 */loading

      var handlersEvery = store._medux_.effectMap[action.type.replace(new RegExp("[^" + config.NSP + "]+"), '*')] || {};

      var handlers = _objectSpread({}, handlersCommon, {}, handlersEvery);

      var handlerModules = Object.keys(handlers);

      if (handlerModules.length > 0) {
        var orderList = [];
        var priority = action.priority ? [...action.priority] : [];
        handlerModules.forEach(moduleName => {
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
        orderList.unshift(...priority);
        var moduleNameMap = {};
        var promiseResults = [];
        orderList.forEach(moduleName => {
          if (!moduleNameMap[moduleName]) {
            moduleNameMap[moduleName] = true;
            var fun = handlers[moduleName];
            var effectResult = fun(...getActionData(action), prevState);
            var decorators = fun.__decorators__;

            if (decorators) {
              var results = [];
              decorators.forEach((decorator, index) => {
                results[index] = decorator[0](action, moduleName, effectResult);
              });
              fun.__decoratorResults__ = results;
            }

            var errorHandler = effectResult.then(reslove => {
              if (decorators) {
                var _results = fun.__decoratorResults__ || [];

                decorators.forEach((decorator, index) => {
                  if (decorator[1]) {
                    decorator[1]('Resolved', _results[index], reslove);
                  }
                });
                fun.__decoratorResults__ = undefined;
              }

              return reslove;
            }, error => {
              if (decorators) {
                var _results2 = fun.__decoratorResults__ || [];

                decorators.forEach((decorator, index) => {
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

  var preLoadMiddleware = () => next => action => {
    var [moduleName, actionName] = action.type.split(config.NSP);

    if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
      var initModel = loadModel(moduleName, store);

      if (isPromise(initModel)) {
        return initModel.then(() => next(action));
      }
    }

    return next(action);
  };

  var middlewareEnhancer = applyMiddleware(preLoadMiddleware, ...storeMiddlewares, middleware);

  var enhancer = newCreateStore => {
    return function () {
      var newStore = newCreateStore(...arguments);
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

  var enhancers = [...storeEnhancers, middlewareEnhancer, enhancer];

  if (MetaData.isDev && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  var store = createStore(combineReducers, preloadedState, compose(...enhancers));
  bindHistory(store, history);
  MetaData.clientStore = store;
  return store;
}
//# sourceMappingURL=store.js.map