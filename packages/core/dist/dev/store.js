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
import { MetaData, NSP, client } from './basic';
import { ActionTypes, errorAction, viewInvalidAction } from './actions';
import { applyMiddleware, compose, createStore } from 'redux';
import { isPlainObject } from './sprite';
var invalidViewTimer;

function checkInvalidview() {
  invalidViewTimer = 0;
  var currentViews = MetaData.clientStore._medux_.currentViews;
  var views = {};

  for (var moduleName in currentViews) {
    if (currentViews.hasOwnProperty(moduleName)) {
      var element = currentViews[moduleName];

      for (var viewname in element) {
        if (element[viewname]) {
          if (!views[moduleName]) {
            views[moduleName] = {};
          }

          views[moduleName][viewname] = element[viewname];
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
    invalidViewTimer = setTimeout(checkInvalidview, 0);
  }
}
export function viewWillMount(moduleName, viewName) {
  if (MetaData.isServer) {
    return;
  }

  var currentViews = MetaData.clientStore._medux_.currentViews;

  if (!currentViews[moduleName]) {
    var _currentViews$moduleN;

    currentViews[moduleName] = (_currentViews$moduleN = {}, _currentViews$moduleN[viewName] = 1, _currentViews$moduleN);
  } else {
    var views = currentViews[moduleName];

    if (!views[viewName]) {
      views[viewName] = 1;
    } else {
      views[viewName]++;
    }
  }

  invalidview();
}
export function viewWillUnmount(moduleName, viewName) {
  if (MetaData.isServer) {
    return;
  }

  var currentViews = MetaData.clientStore._medux_.currentViews;

  if (currentViews[moduleName] && currentViews[moduleName][viewName]) {
    currentViews[moduleName][viewName]--;
  }

  invalidview();
}

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

function simpleEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  } else if (typeof obj1 !== typeof obj2 || typeof obj1 !== 'object') {
    return false;
  } else {
    var keys1 = Object.keys(obj1);
    var keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    } else {
      for (var _i = 0, _keys = keys1; _i < _keys.length; _i++) {
        var _key = _keys[_i];

        if (!simpleEqual(obj1[_key], obj2[_key])) {
          return false;
        }
      }

      return true;
    }
  }
}

export function buildStore(preloadedState, storeReducers, storeMiddlewares, storeEnhancers) {
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

  var store;

  var combineReducers = function combineReducers(rootState, action) {
    if (!store) {
      return rootState;
    }

    var meta = store._medux_;
    meta.prevState = rootState;

    var currentState = _objectSpread({}, rootState);

    meta.currentState = currentState;

    if (!currentState.views) {
      currentState.views = {};
    }

    Object.keys(storeReducers).forEach(function (moduleName) {
      currentState[moduleName] = storeReducers[moduleName](currentState[moduleName], action);
    });

    if (action.type === ActionTypes.F_VIEW_INVALID) {
      var views = getActionData(action);

      if (!simpleEqual(currentState.views, views)) {
        currentState.views = views;
      }
    }

    var handlersCommon = meta.reducerMap[action.type] || {}; // 支持泛监听，形如 */loading

    var handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + NSP + "]+"), '*')] || {};

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
  }; // const enhancers = [applyMiddleware(...[effectMiddleware, routerMiddleware(storeHistory), ...storeMiddlewares]), ...storeEnhancers];
  // if (MetaData.isBrowser && MetaData.isDev && window["__REDUX_DEVTOOLS_EXTENSION__"]) {
  //
  // __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  // enhancers.push(window["__REDUX_DEVTOOLS_EXTENSION__"](window["__REDUX_DEVTOOLS_EXTENSION__OPTIONS"]));
  // }
  // store = createStore(combineReducers as any, initData, compose(...enhancers));


  var middlewareEnhancer = applyMiddleware.apply(void 0, storeMiddlewares.concat([middleware]));

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