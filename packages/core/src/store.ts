/* eslint-disable @typescript-eslint/no-use-before-define */
import {Middleware, ReducersMapObject, StoreEnhancer, applyMiddleware, compose, createStore} from 'redux';
import {Action, ActionTypes, MetaData, ModuleStore, config, isPromise, snapshotState, mergeState, warn} from './basic';
import {loadModel} from './inject';
import {client, isServerEnv} from './env';
import {errorAction} from './actions';

/**
 * 创建Store时的选项，通过renderApp或renderSSR传入
 */
export interface StoreOptions {
  /**
   * 如果你需要独立的第三方reducers可以通过此注入
   * - store根节点下reducers数据和module数据，可通过isModule来区分
   */
  reducers?: ReducersMapObject;
  /**
   * redux中间件
   */
  middlewares?: Middleware[];
  /**
   * redux增强器
   */
  enhancers?: StoreEnhancer[];
  /**
   * store的初始数据
   */
  initData?: {[key: string]: any};
}

/**
 * 从redux action上获取有效数据载体
 * @param action redux的action
 */
export function getActionData(action: Action): any[] {
  return Array.isArray(action.payload) ? action.payload : [];
}

function isProcessedError(error: any): boolean {
  return error && !!error.__meduxProcessed__;
}
function setProcessedError(error: any, meduxProcessed: boolean): {__meduxProcessed__: boolean; [key: string]: any} {
  if (typeof error !== 'object') {
    error = {message: error};
  }
  Object.defineProperty(error, '__meduxProcessed__', {value: meduxProcessed, enumerable: false, writable: true});
  return error;
}
export function buildStore(
  preloadedState: {[key: string]: any} = {},
  storeReducers: ReducersMapObject<any, any> = {},
  storeMiddlewares: Middleware[] = [],
  storeEnhancers: StoreEnhancer[] = []
): ModuleStore {
  if (MetaData.clientStore) {
    MetaData.clientStore.destroy();
  }
  let store: ModuleStore;
  const combineReducers = (state: Record<string, any>, action: Action) => {
    if (!store) {
      return state;
    }
    const meta = store._medux_;
    const currentState = meta.currentState;
    const realtimeState = meta.realtimeState;

    Object.keys(storeReducers).forEach((moduleName) => {
      const node = storeReducers[moduleName](state[moduleName], action);
      if (config.MutableData && realtimeState[moduleName] && realtimeState[moduleName] !== node) {
        warn('Use rewrite instead of replace to update state in MutableData');
      }
      realtimeState[moduleName] = node;
    });

    const handlersCommon = meta.reducerMap[action.type] || {};
    // 支持泛监听，形如 */loading
    const handlersEvery = meta.reducerMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = {...handlersCommon, ...handlersEvery};
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList: string[] = [];
      const priority: string[] = action.priority ? [...action.priority] : [];
      const actionData = getActionData(action);
      handlerModules.forEach((moduleName) => {
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
      const moduleNameMap: {[key: string]: boolean} = {};
      orderList.forEach((moduleName) => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          const fun = handlers[moduleName];
          const node = fun(...actionData, currentState);
          if (config.MutableData && realtimeState[moduleName] && realtimeState[moduleName] !== node) {
            warn('Use rewrite instead of replace to update state in MutableData');
          }
          realtimeState[moduleName] = node;
        }
      });
    }

    return realtimeState;
  };
  const middleware: Middleware = ({dispatch}) => (next) => (originalAction) => {
    if (originalAction.type === ActionTypes.Error) {
      const actionData = getActionData(originalAction);
      if (isProcessedError(actionData[0])) {
        return originalAction;
      }
      actionData[0] = setProcessedError(actionData[0], true);
    }
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
    const action: Action = next(originalAction);
    const handlersCommon = meta.effectMap[action.type] || {};
    // 支持泛监听，形如 */loading
    const handlersEvery = meta.effectMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = {...handlersCommon, ...handlersEvery};
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const actionData = getActionData(action);
      const orderList: string[] = [];
      const priority: string[] = action.priority ? [...action.priority] : [];
      handlerModules.forEach((moduleName) => {
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
      const moduleNameMap: {[key: string]: boolean} = {};
      const promiseResults: Promise<any>[] = [];
      orderList.forEach((moduleName) => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          const fun = handlers[moduleName];
          const effectResult: Promise<any> = fun(...actionData, currentState);
          const decorators = fun.__decorators__;
          if (decorators) {
            const results: any[] = [];
            decorators.forEach((decorator, index) => {
              results[index] = decorator[0](action, moduleName, effectResult);
            });
            fun.__decoratorResults__ = results;
          }

          const errorHandler = effectResult.then(
            (reslove: any) => {
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
            },
            (reason: any) => {
              if (decorators) {
                const results = fun.__decoratorResults__ || [];
                decorators.forEach((decorator, index) => {
                  if (decorator[1]) {
                    decorator[1]('Rejected', results[index], reason);
                  }
                });
                fun.__decoratorResults__ = undefined;
              }
              if (isProcessedError(reason)) {
                throw reason;
              } else {
                reason = setProcessedError(reason, false);
                return dispatch(errorAction(reason)) as any;
              }
            }
          );

          promiseResults.push(errorHandler);
        }
      });
      if (promiseResults.length) {
        return Promise.all(promiseResults);
      }
    }
    return action;
  };

  const preLoadMiddleware: Middleware = () => (next) => (action) => {
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
  const enhancer: StoreEnhancer = (newCreateStore) => {
    return (...args) => {
      const newStore = newCreateStore(...args);
      const moduleStore: ModuleStore = newStore as any;
      moduleStore._medux_ = {
        realtimeState: {} as any,
        currentState: {} as any,
        reducerMap: {},
        effectMap: {},
        injectedModules: {},
      };
      return newStore;
    };
  };
  const enhancers = [middlewareEnhancer, enhancer, ...storeEnhancers];
  if (config.DEVTOOLS && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }
  store = createStore(combineReducers as any, preloadedState, compose(...enhancers));
  store.destroy = () => undefined;
  if (!isServerEnv) {
    MetaData.clientStore = store;
  }
  return store;
}
