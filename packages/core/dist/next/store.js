import { ActionTypes, MetaData, client, config, isProcessedError, isPromise, setProcessedError } from './basic';
import { applyMiddleware, compose, createStore } from 'redux';
import { errorAction, routeChangeAction, routeParamsAction } from './actions';

function isPromiseModule(module) {
  return typeof module['then'] === 'function';
}

export function loadModel(moduleName, store, options) {
  const hasInjected = !!store._medux_.injectedModules[moduleName];

  if (!hasInjected) {
    const moduleGetter = MetaData.moduleGetter;
    const result = moduleGetter[moduleName]();

    if (isPromiseModule(result)) {
      return result.then(module => {
        moduleGetter[moduleName] = () => module;

        return module.default.model(store, options);
      });
    } else {
      return result.default.model(store, options);
    }
  }
}
export function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

function bindHistory(store, history) {
  let inTimeTravelling = false;

  const handleLocationChange = location => {
    if (!inTimeTravelling) {
      const {
        route
      } = store.getState();

      if (route) {
        if (history.equal(route.location, location)) {
          return;
        }
      }

      const data = history.locationToRouteData(location);
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
      const storeRouteState = store.getState().route;

      if (!history.equal(storeRouteState.location, history.getLocation())) {
        inTimeTravelling = true;
        history.patch(storeRouteState.location, storeRouteState.data);
      }
    }
  });
  history.initialized && handleLocationChange(history.getLocation());
}

export function buildStore(history, preloadedState = {}, storeReducers = {}, storeMiddlewares = [], storeEnhancers = []) {
  if (storeReducers.route) {
    throw new Error("the reducer name 'route' is not allowed");
  }

  storeReducers.route = (state, action) => {
    if (action.type === ActionTypes.RouteChange) {
      const payload = getActionData(action)[0];

      if (!state) {
        return payload;
      }

      return Object.assign({}, state, {}, payload);
    }

    return state;
  };

  const combineReducers = (rootState, action) => {
    if (!store) {
      return rootState;
    }

    const meta = store._medux_;
    meta.prevState = rootState;
    const currentState = Object.assign({}, rootState);
    meta.currentState = currentState;
    Object.keys(storeReducers).forEach(moduleName => {
      currentState[moduleName] = storeReducers[moduleName](currentState[moduleName], action);
    });
    const handlersCommon = meta.reducerMap[action.type] || {};
    const handlersEvery = meta.reducerMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = Object.assign({}, handlersCommon, {}, handlersEvery);
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList = [];
      const priority = action.priority ? [...action.priority] : [];
      handlerModules.forEach(moduleName => {
        const fun = handlers[moduleName];

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
      const moduleNameMap = {};
      orderList.forEach(moduleName => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          const fun = handlers[moduleName];
          currentState[moduleName] = fun(...getActionData(action));
        }
      });
    }

    const changed = Object.keys(rootState).length !== Object.keys(currentState).length || Object.keys(rootState).some(moduleName => rootState[moduleName] !== currentState[moduleName]);
    meta.prevState = changed ? currentState : rootState;
    return meta.prevState;
  };

  const middleware = ({
    dispatch
  }) => next => originalAction => {
    if (MetaData.isServer) {
      if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
        return originalAction;
      }
    }

    const meta = store._medux_;
    meta.beforeState = meta.prevState;
    const action = next(originalAction);

    if (action.type === ActionTypes.RouteChange) {
      const rootRouteParams = meta.prevState.route.data.params;
      Object.keys(rootRouteParams).forEach(moduleName => {
        const routeParams = rootRouteParams[moduleName];

        if (routeParams && Object.keys(routeParams).length > 0 && meta.injectedModules[moduleName]) {
          dispatch(routeParamsAction(moduleName, routeParams));
        }
      });
    }

    const handlersCommon = meta.effectMap[action.type] || {};
    const handlersEvery = meta.effectMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = Object.assign({}, handlersCommon, {}, handlersEvery);
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList = [];
      const priority = action.priority ? [...action.priority] : [];
      handlerModules.forEach(moduleName => {
        const fun = handlers[moduleName];

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
      const moduleNameMap = {};
      const promiseResults = [];
      orderList.forEach(moduleName => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          const fun = handlers[moduleName];
          const effectResult = fun(...getActionData(action));
          const decorators = fun.__decorators__;

          if (decorators) {
            const results = [];
            decorators.forEach((decorator, index) => {
              results[index] = decorator[0](action, moduleName, effectResult);
            });
            fun.__decoratorResults__ = results;
          }

          const errorHandler = effectResult.then(reslove => {
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
          }, error => {
            if (decorators) {
              const results = fun.__decoratorResults__ || [];
              decorators.forEach((decorator, index) => {
                if (decorator[1]) {
                  decorator[1]('Rejected', results[index], error);
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

  const preLoadMiddleware = () => next => action => {
    const [moduleName, actionName] = action.type.split(config.NSP);

    if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
      const initModel = loadModel(moduleName, store, undefined);

      if (isPromise(initModel)) {
        return initModel.then(() => next(action));
      }
    }

    return next(action);
  };

  const middlewareEnhancer = applyMiddleware(preLoadMiddleware, ...storeMiddlewares, middleware);

  const enhancer = newCreateStore => {
    return (...args) => {
      const newStore = newCreateStore(...args);
      const modelStore = newStore;
      modelStore._medux_ = {
        beforeState: {},
        prevState: {},
        currentState: {},
        reducerMap: {},
        effectMap: {},
        injectedModules: {}
      };
      return newStore;
    };
  };

  const enhancers = [...storeEnhancers, middlewareEnhancer, enhancer];

  if (MetaData.isDev && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  const store = createStore(combineReducers, preloadedState, compose(...enhancers));
  bindHistory(store, history);
  MetaData.clientStore = store;
  return store;
}