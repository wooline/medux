import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import { applyMiddleware, compose, createStore } from 'redux';
import { MetaData, NSP, client } from './basic';
import { isPlainObject } from './sprite';
import { errorAction, viewInvalidAction, ActionTypes } from './actions';
let invalidViewTimer;

function checkInvalidview() {
  invalidViewTimer = 0;
  const currentViews = MetaData.clientStore._medux_.currentViews;
  const views = {};

  for (const moduleName in currentViews) {
    if (currentViews.hasOwnProperty(moduleName)) {
      const element = currentViews[moduleName];

      for (const viewname in element) {
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

function invalidview() {
  if (!invalidViewTimer) {
    invalidViewTimer = setTimeout(checkInvalidview, 0);
  }
}

export function viewWillMount(moduleName, viewName) {
  const currentViews = MetaData.clientStore._medux_.currentViews;

  if (!currentViews[moduleName]) {
    currentViews[moduleName] = {
      [viewName]: 1
    };
  } else {
    const views = currentViews[moduleName];

    if (!views[viewName]) {
      views[viewName] = 1;
    } else {
      views[viewName]++;
    }
  }

  invalidview();
}
export function viewWillUnmount(moduleName, viewName) {
  const currentViews = MetaData.clientStore._medux_.currentViews;

  if (currentViews[moduleName] && currentViews[moduleName][viewName]) {
    currentViews[moduleName][viewName]--;
  }

  invalidview();
}

function getActionData(action) {
  const arr = Object.keys(action).filter(key => key !== 'type' && key !== 'priority' && key !== 'time');

  if (arr.length === 0) {
    return undefined;
  } else if (arr.length === 1) {
    return action[arr[0]];
  } else {
    const data = _objectSpread({}, action);

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
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    } else {
      for (const key of keys1) {
        if (!simpleEqual(obj1[key], obj2[key])) {
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

  let store;

  const combineReducers = (rootState, action) => {
    if (!store) {
      return rootState;
    }

    const meta = store._medux_;
    meta.prevState = rootState;

    const currentState = _objectSpread({}, rootState);

    meta.currentState = currentState;

    if (!currentState.views) {
      currentState.views = {};
    }

    Object.keys(storeReducers).forEach(namespace => {
      currentState[namespace] = storeReducers[namespace](currentState[namespace], action);
    });

    if (action.type === ActionTypes.F_VIEW_INVALID) {
      const views = getActionData(action);

      if (!simpleEqual(currentState.views, views)) {
        currentState.views = views;
      }
    }

    const handlersCommon = meta.reducerMap[action.type] || {}; // 支持泛监听，形如 */loading

    const handlersEvery = meta.reducerMap[action.type.replace(new RegExp("[^" + NSP + "]+"), '*')] || {};

    const handlers = _objectSpread({}, handlersCommon, handlersEvery);

    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList = action.priority ? [...action.priority] : [];
      handlerModules.forEach(namespace => {
        const fun = handlers[namespace];

        if (fun.__isHandler__) {
          orderList.push(namespace);
        } else {
          orderList.unshift(namespace);
        }
      });
      const moduleNameMap = {};
      orderList.forEach(namespace => {
        if (!moduleNameMap[namespace]) {
          moduleNameMap[namespace] = true;
          const fun = handlers[namespace];
          currentState[namespace] = fun(getActionData(action));
        }
      });
    }

    const changed = Object.keys(rootState).length !== Object.keys(currentState).length || Object.keys(rootState).some(namespace => rootState[namespace] !== currentState[namespace]);
    meta.prevState = changed ? currentState : rootState;
    return meta.prevState;
  };

  const middleware = () => next => originalAction => {
    if (MetaData.isServer) {
      if (originalAction.type.split(NSP)[1] === ActionTypes.M_LOADING) {
        return originalAction;
      }
    }

    const action = next(originalAction);
    const handlersCommon = store._medux_.effectMap[action.type] || {}; // 支持泛监听，形如 */loading

    const handlersEvery = store._medux_.effectMap[action.type.replace(new RegExp("[^" + NSP + "]+"), '*')] || {};

    const handlers = _objectSpread({}, handlersCommon, handlersEvery);

    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList = action.priority ? [...action.priority] : [];
      handlerModules.forEach(namespace => {
        const fun = handlers[namespace];

        if (fun.__isHandler__) {
          orderList.push(namespace);
        } else {
          orderList.unshift(namespace);
        }
      });
      const moduleNameMap = {};
      const promiseResults = [];
      orderList.forEach(namespace => {
        if (!moduleNameMap[namespace]) {
          moduleNameMap[namespace] = true;
          const fun = handlers[namespace];
          const effectResult = fun(getActionData(action));
          const decorators = fun.__decorators__;

          if (decorators) {
            const results = [];
            decorators.forEach((decorator, index) => {
              results[index] = decorator[0](action, namespace, effectResult);
            });
            fun.__decoratorResults__ = results;
          }

          effectResult.then(reslove => {
            if (decorators) {
              const results = fun.__decoratorResults__ || [];
              decorators.forEach((decorator, index) => {
                if (decorator[1]) {
                  decorator[1]('Resolved', results[index], reslove);
                }
              });
              fun.__decoratorResults__ = undefined;
            }

            return reslove;
          }, reject => {
            if (decorators) {
              const results = fun.__decoratorResults__ || [];
              decorators.forEach((decorator, index) => {
                if (decorator[1]) {
                  decorator[1]('Rejected', results[index], reject);
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
  }; // const enhancers = [applyMiddleware(...[effectMiddleware, routerMiddleware(storeHistory), ...storeMiddlewares]), ...storeEnhancers];
  // if (MetaData.isBrowser && MetaData.isDev && window["__REDUX_DEVTOOLS_EXTENSION__"]) {
  //
  // __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  // enhancers.push(window["__REDUX_DEVTOOLS_EXTENSION__"](window["__REDUX_DEVTOOLS_EXTENSION__OPTIONS"]));
  // }
  // store = createStore(combineReducers as any, initData, compose(...enhancers));


  const middlewareEnhancer = applyMiddleware(...storeMiddlewares, middleware);

  const enhancer = newCreateStore => {
    return function () {
      const newStore = newCreateStore(...arguments);
      const modelStore = newStore;
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

  const enhancers = [...storeEnhancers, middlewareEnhancer, enhancer];

  if (MetaData.isDev && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  store = createStore(combineReducers, preloadedState, compose(...enhancers));
  MetaData.clientStore = store;

  if (client) {
    if ('onerror' in client) {
      client.addEventListener('error', event => {
        store.dispatch(errorAction(event));
      }, true);
    }

    if ('onunhandledrejection' in client) {
      client.addEventListener('unhandledrejection', event => {
        store.dispatch(errorAction(event.reason));
      }, true);
    }
  }

  return store;
}
//# sourceMappingURL=store.js.map