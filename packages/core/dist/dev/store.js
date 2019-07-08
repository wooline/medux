import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise";
import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.to-string";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.split";
import "core-js/modules/web.dom-collections.for-each";
import "core-js/modules/web.dom-collections.iterator";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import { MetaData, NSP, client, isPromise } from './basic';
import { ActionTypes, errorAction, routeChangeAction } from './actions';
import { applyMiddleware, compose, createStore } from 'redux';
import { injectModel } from './module';
import { isPlainObject } from './sprite';
/**
 * dispatch push action
 * middleware 拦截并调用history.push
 * history触发侦听器，dispatch change action
 * store侦听器，判断是否时光
 */

var invalidViewTimer;

function checkInvalidview() {
  invalidViewTimer = 0;
  var currentViews = MetaData.clientStore._medux_.currentViews;
  var views = {};

  for (var _moduleName in currentViews) {
    if (currentViews.hasOwnProperty(_moduleName)) {
      var element = currentViews[_moduleName];

      for (var viewname in element) {
        if (element[viewname]) {
          var n = Object.keys(element[viewname]).length;

          if (n) {
            if (!views[_moduleName]) {
              views[_moduleName] = {};
            }

            views[_moduleName][viewname] = true;
          }
        }
      }
    }
  } // MetaData.clientStore.dispatch(viewInvalidAction(views));

}

export function invalidview() {
  if (MetaData.isServer) {
    return;
  }

  if (!invalidViewTimer) {
    invalidViewTimer = setTimeout(checkInvalidview, 300);
  }
}
export function viewWillMount(moduleName, viewName, vid) {
  if (MetaData.isServer) {
    return;
  }

  var currentViews = MetaData.clientStore._medux_.currentViews;

  if (!currentViews[moduleName]) {
    var _viewName, _currentViews$moduleN;

    currentViews[moduleName] = (_currentViews$moduleN = {}, _currentViews$moduleN[viewName] = (_viewName = {}, _viewName[vid] = true, _viewName), _currentViews$moduleN);
  } else {
    var views = currentViews[moduleName];

    if (!views[viewName]) {
      var _views$viewName;

      views[viewName] = (_views$viewName = {}, _views$viewName[vid] = true, _views$viewName);
    } else {
      views[viewName][vid] = true;
    }
  }

  invalidview();
}
export function viewWillUnmount(moduleName, viewName, vid) {
  if (MetaData.isServer) {
    return;
  }

  var currentViews = MetaData.clientStore._medux_.currentViews;

  if (currentViews[moduleName] && currentViews[moduleName][viewName]) {
    var views = currentViews[moduleName][viewName];
    delete views[vid];
  }

  invalidview();
} // function excludeDefaultParams(data:any){
//   return excludeDefaultData(data, MetaData.defaultRouteParams);
// }
// function excludeDefaultData(data: any, def: any) {
//   const result: any = {};
//   for (const key in data) {
//     if (data.hasOwnProperty(key)) {
//       const value = data[key];
//       const defaultValue = def[key];
//       if (value !== defaultValue) {
//         if (typeof value === typeof defaultValue && typeof value === 'object' && !Array.isArray(value)) {
//           result[key] = excludeDefaultData(value, defaultValue);
//         } else {
//           result[key] = value;
//         }
//       }
//     }
//   }
//   if (Object.keys(result).length === 0) {
//     return undefined;
//   }
//   return result;
// }

function getActionData(action) {
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

    if (history.isTimeTravel(storeRouteState.location)) {
      inTimeTravelling = true;
      history.patch(storeRouteState.location, storeRouteState.data);
    }
  });
  handleLocationChange(history.getLocation());
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

  if (!isPlainObject(preloadedState)) {
    throw new Error('preloadedState must be plain objects!');
  }

  if (!isPlainObject(storeReducers)) {
    throw new Error('storeReducers must be plain objects!');
  }

  if (storeReducers.route) {
    throw new Error("the reducer name 'route' is not allowed");
  }

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
      var orderList = []; //

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
          var orderList = action.priority ? [].concat(action.priority) : [];
          handlerModules.forEach(function (moduleName) {
            var fun = handlers[moduleName];

            if (fun.__isHandler__) {
              orderList.push(moduleName);
            } else {
              orderList.unshift(moduleName);
            }
          });
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

              effectResult.then(function (reslove) {
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
              }, function (reject) {
                if (decorators) {
                  var _results2 = fun.__decoratorResults__ || [];

                  decorators.forEach(function (decorator, index) {
                    if (decorator[1]) {
                      decorator[1]('Rejected', _results2[index], reject);
                    }
                  });
                  fun.__decoratorResults__ = undefined;
                }
              });
              promiseResults.push(effectResult);
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
        prevState: {
          router: null
        },
        currentState: {
          router: null
        },
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

  if (client) {
    if ('onerror' in client) {
      client.addEventListener('error', function (event) {
        store.dispatch(errorAction(event));
      }, true);
    }

    if ('onunhandledrejection' in client) {
      client.addEventListener('unhandledrejection', function (event) {
        store.dispatch(errorAction(event.reason));
      }, true);
    }
  }

  return store;
}
//# sourceMappingURL=store.js.map