import { applyMiddleware, compose, createStore } from 'redux';
import { ActionTypes, MetaData, config, isPromise, snapshotState, mergeState, warn } from './basic';
import { loadModel } from './inject';
import { client, isServerEnv } from './env';
import { errorAction } from './actions';
export function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

function isProcessedError(error) {
  if (typeof error !== 'object' || error.meduxProcessed === undefined) {
    return undefined;
  }

  return !!error.meduxProcessed;
}

function setProcessedError(error, meduxProcessed) {
  if (typeof error === 'object') {
    error.meduxProcessed = meduxProcessed;
    return error;
  }

  return {
    meduxProcessed,
    error
  };
}

export function buildStore(preloadedState = {}, storeReducers = {}, storeMiddlewares = [], storeEnhancers = []) {
  if (MetaData.clientStore) {
    MetaData.clientStore.destroy();
  }

  let store;

  const combineReducers = (state, action) => {
    if (!store) {
      return state;
    }

    const meta = store._medux_;
    const currentState = meta.currentState;
    const realtimeState = meta.realtimeState;
    Object.keys(storeReducers).forEach(moduleName => {
      const node = storeReducers[moduleName](state[moduleName], action);

      if (config.MutableData && realtimeState[moduleName] !== node) {
        warn('Use rewrite instead of replace to update state in MutableData');
      }

      realtimeState[moduleName] = node;
    });
    const handlersCommon = meta.reducerMap[action.type] || {};
    const handlersEvery = meta.reducerMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = Object.assign({}, handlersCommon, handlersEvery);
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
          const node = fun(...getActionData(action), currentState);

          if (config.MutableData && realtimeState[moduleName] !== node) {
            warn('Use rewrite instead of replace to update state in MutableData');
          }

          realtimeState[moduleName] = node;
        }
      });
    }

    return realtimeState;
  };

  const middleware = ({
    dispatch
  }) => next => originalAction => {
    if (isServerEnv) {
      if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
        return originalAction;
      }
    }

    const meta = store._medux_;
    const rootState = store.getState();
    meta.realtimeState = mergeState(rootState);
    meta.currentState = snapshotState(rootState);
    const currentState = meta.currentState;
    const action = next(originalAction);
    const handlersCommon = meta.effectMap[action.type] || {};
    const handlersEvery = meta.effectMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = Object.assign({}, handlersCommon, handlersEvery);
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
          const effectResult = fun(...getActionData(action), currentState);
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
      const hasInjected = store._medux_.injectedModules[moduleName];

      if (!hasInjected) {
        if (actionName === ActionTypes.MInit) {
          return loadModel(moduleName, store);
        }

        const initModel = loadModel(moduleName, store);

        if (isPromise(initModel)) {
          return initModel.then(() => next(action));
        }
      }
    }

    return next(action);
  };

  const middlewareEnhancer = applyMiddleware(preLoadMiddleware, ...storeMiddlewares, middleware);

  const enhancer = newCreateStore => {
    return (...args) => {
      const newStore = newCreateStore(...args);
      const moduleStore = newStore;
      moduleStore._medux_ = {
        realtimeState: {},
        currentState: {},
        reducerMap: {},
        effectMap: {},
        injectedModules: {}
      };
      return newStore;
    };
  };

  const enhancers = [middlewareEnhancer, enhancer, ...storeEnhancers];

  if (config.DEVTOOLS && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  store = createStore(combineReducers, preloadedState, compose(...enhancers));

  store.destroy = () => undefined;

  if (!isServerEnv) {
    MetaData.clientStore = store;
  }

  return store;
}