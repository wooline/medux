import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import { MetaData, NSP, client, isProcessedError, isPromise, setProcessedError } from './basic';
import { ActionTypes, errorAction, routeChangeAction } from './actions';
import { applyMiddleware, compose, createStore } from 'redux';
import { injectModel } from './module';
import { isPlainObject } from './sprite';
/*
let invalidViewTimer: number;

function checkInvalidview() {
  invalidViewTimer = 0;
  const currentViews = MetaData.clientStore._medux_.currentViews;
  const views: DisplayViews = {};
  for (const moduleName in currentViews) {
    if (currentViews.hasOwnProperty(moduleName)) {
      const element = currentViews[moduleName];
      for (const viewname in element) {
        if (element[viewname]) {
          const n = Object.keys(element[viewname]).length;
          if (n) {
            if (!views[moduleName]) {
              views[moduleName] = {};
            }
            views[moduleName][viewname] = true;
          }
        }
      }
    }
  }
  MetaData.clientStore.dispatch(viewInvalidAction(views));
}

export function invalidview() {
  if (MetaData.isServer) {
    return;
  }
  if (!invalidViewTimer) {
    invalidViewTimer = setTimeout(checkInvalidview, 300);
  }
}

export function viewWillMount(moduleName: string, viewName: string, vid: string) {
  if (MetaData.isServer) {
    return;
  }
  const currentViews = MetaData.clientStore._medux_.currentViews;
  if (!currentViews[moduleName]) {
    currentViews[moduleName] = {[viewName]: {[vid]: true}};
  } else {
    const views = currentViews[moduleName];
    if (!views[viewName]) {
      views[viewName] = {[vid]: true};
    } else {
      views[viewName][vid] = true;
    }
  }
  invalidview();
}

export function viewWillUnmount(moduleName: string, viewName: string, vid: string) {
  if (MetaData.isServer) {
    return;
  }
  const currentViews = MetaData.clientStore._medux_.currentViews;
  if (currentViews[moduleName] && currentViews[moduleName][viewName]) {
    const views = currentViews[moduleName][viewName];
    delete views[vid];
  }
  invalidview();
}
*/

export function getActionData(action) {
  var arr = Object.keys(action).filter(function (key) {
    return key !== 'type' && key !== 'priority' && key !== 'time';
  });

  if (arr.length === 0) {
    return undefined;
  } else if (arr.length === 1) {
    return action[arr[0]];
  } else {
    var data = _objectSpread({}, action);

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
      store.dispatch(routeChangeAction({
        location: location,
        data: data
      }));
    } else {
      inTimeTravelling = false;
    }
  };

  history.subscribe(handleLocationChange);
  store.subscribe(function () {
    var storeRouteState = store.getState().route;

    if (!history.equal(storeRouteState.location, history.getLocation())) {
      inTimeTravelling = true;
      history.patch(storeRouteState.location, storeRouteState.data);
    }
  });
  handleLocationChange(history.getLocation());
}

export function buildStore(history, preloadedState, storeReducers, storeMiddlewares, storeEnhancers, defaultRouteParams) {
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

  if (defaultRouteParams === void 0) {
    defaultRouteParams = {};
  }

  if (!isPlainObject(preloadedState)) {
    throw new Error('preloadedState must be plain objects!');
  }

  if (!isPlainObject(storeReducers)) {
    throw new Error('storeReducers must be plain objects!');
  }

  if (storeReducers.route) {
    throw new Error("the reducer name 'route' is not allowed");
  }

  Object.assign(MetaData.defaultRouteParams, defaultRouteParams);

  storeReducers.route = function (state, action) {
    if (action.type === ActionTypes.F_ROUTE_CHANGE) {
      var payload = getActionData(action);

      if (!state) {
        return payload;
      }

      return _objectSpread({}, state, payload);
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

    var currentState = _objectSpread({}, rootState);

    meta.currentState = currentState;
    Object.keys(storeReducers).forEach(function (moduleName) {
      currentState[moduleName] = storeReducers[moduleName](currentState[moduleName], action);
    });
    var handlersCommon = meta.reducerMap[action.type] || {}; // 支持泛监听，形如 */loading

    var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + NSP + "]+"), '*')] || {};

    var handlers = _objectSpread({}, handlersCommon, handlersEvery);

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

  var middleware = function middleware() {
    return function (next) {
      return function (originalAction) {
        if (MetaData.isServer) {
          if (originalAction.type.split(NSP)[1] === ActionTypes.M_LOADING) {
            return originalAction;
          }
        }

        var action = next(originalAction);
        var handlersCommon = store._medux_.effectMap[action.type] || {}; // 支持泛监听，形如 */loading

        var handlersEvery = store._medux_.effectMap[action.type.replace(new RegExp("[^" + NSP + "]+"), '*')] || {};

        var handlers = _objectSpread({}, handlersCommon, handlersEvery);

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
              var effectResult = fun(getActionData(action));
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

                if (action.type === ActionTypes.F_ERROR) {
                  if (isProcessedError(error) === undefined) {
                    error = setProcessedError(error, true);
                  }

                  throw error;
                } else if (isProcessedError(error)) {
                  throw error;
                } else {
                  return store.dispatch(errorAction(error));
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
        var _action$type$split = action.type.split(NSP),
            moduleName = _action$type$split[0],
            actionName = _action$type$split[1];

        if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
          var initModel = injectModel(MetaData.moduleGetter, moduleName, store);

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

  if (MetaData.isDev && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  store = createStore(combineReducers, preloadedState, compose.apply(void 0, enhancers));
  bindHistory(store, history);
  MetaData.clientStore = store;
  return store;
}
//# sourceMappingURL=store.js.map