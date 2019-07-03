import {Action, CurrentViews, MetaData, ModelStore, NSP, client, isPromise} from './basic';
import {ActionTypes, errorAction, viewInvalidAction} from './actions';
import {Middleware, ReducersMapObject, StoreEnhancer, applyMiddleware, compose, createStore} from 'redux';

import {injectModel} from './module';
import {isPlainObject} from './sprite';

let invalidViewTimer: number;

function checkInvalidview() {
  invalidViewTimer = 0;
  const currentViews = MetaData.clientStore._medux_.currentViews;
  const views: CurrentViews = {};
  for (const moduleName in currentViews) {
    if (currentViews.hasOwnProperty(moduleName)) {
      const element = currentViews[moduleName];
      for (const viewname in element) {
        if (element[viewname]) {
          views[moduleName][viewname] = true;
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

export function viewWillMount(moduleName: string, viewName: string) {
  if (MetaData.isServer) {
    return;
  }
  const currentViews = MetaData.clientStore._medux_.currentViews;
  if (!currentViews[moduleName]) {
    currentViews[moduleName] = {[viewName]: true};
  } else {
    currentViews[moduleName][viewName] = true;
  }
  invalidview();
}

export function viewWillUnmount(moduleName: string, viewName: string) {
  if (MetaData.isServer) {
    return;
  }
  const currentViews = MetaData.clientStore._medux_.currentViews;
  if (currentViews[moduleName] && currentViews[moduleName][viewName]) {
    delete currentViews[moduleName][viewName];
  }
  invalidview();
}
function getActionData(action: Action) {
  const arr = Object.keys(action).filter(key => key !== 'type' && key !== 'priority' && key !== 'time');
  if (arr.length === 0) {
    return undefined;
  } else if (arr.length === 1) {
    return action[arr[0]];
  } else {
    const data = {...action};
    delete data['type'];
    delete data['priority'];
    delete data['time'];
    return data;
  }
}

function simpleEqual(obj1: any, obj2: any): boolean {
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

export function buildStore(
  preloadedState: {[key: string]: any} = {},
  storeReducers: ReducersMapObject<any, any> = {},
  storeMiddlewares: Middleware[] = [],
  storeEnhancers: StoreEnhancer[] = []
): ModelStore {
  if (!isPlainObject(preloadedState)) {
    throw new Error('preloadedState must be plain objects!');
  }
  if (!isPlainObject(storeReducers)) {
    throw new Error('storeReducers must be plain objects!');
  }
  let store: ModelStore;
  const combineReducers = (rootState: {[key: string]: any}, action: Action) => {
    if (!store) {
      return rootState;
    }
    const meta = store._medux_;
    meta.prevState = rootState;
    const currentState = {...rootState};
    meta.currentState = currentState;

    if (!currentState.views) {
      currentState.views = {};
    }
    Object.keys(storeReducers).forEach(moduleName => {
      currentState[moduleName] = storeReducers[moduleName](currentState[moduleName], action);
    });
    if (action.type === ActionTypes.F_VIEW_INVALID) {
      const views: CurrentViews = getActionData(action);
      if (!simpleEqual(currentState.views, views)) {
        currentState.views = views;
      }
    }
    const handlersCommon = meta.reducerMap[action.type] || {};
    // 支持泛监听，形如 */loading
    const handlersEvery = meta.reducerMap[action.type.replace(new RegExp(`[^${NSP}]+`), '*')] || {};
    const handlers = {...handlersCommon, ...handlersEvery};
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList: string[] = action.priority ? [...action.priority] : [];
      handlerModules.forEach(moduleName => {
        const fun = handlers[moduleName];
        if (fun.__isHandler__) {
          orderList.push(moduleName);
        } else {
          orderList.unshift(moduleName);
        }
      });
      const moduleNameMap: {[key: string]: boolean} = {};
      orderList.forEach(moduleName => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          const fun = handlers[moduleName];
          currentState[moduleName] = fun(getActionData(action));
        }
      });
    }
    const changed = Object.keys(rootState).length !== Object.keys(currentState).length || Object.keys(rootState).some(moduleName => rootState[moduleName] !== currentState[moduleName]);
    meta.prevState = changed ? currentState : rootState;
    return meta.prevState;
  };

  const middleware = () => (next: Function) => (originalAction: Action) => {
    if (MetaData.isServer) {
      if (originalAction.type.split(NSP)[1] === ActionTypes.M_LOADING) {
        return originalAction;
      }
    }
    const action: Action = next(originalAction);
    const handlersCommon = store._medux_.effectMap[action.type] || {};
    // 支持泛监听，形如 */loading
    const handlersEvery = store._medux_.effectMap[action.type.replace(new RegExp(`[^${NSP}]+`), '*')] || {};
    const handlers = {...handlersCommon, ...handlersEvery};
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList: string[] = action.priority ? [...action.priority] : [];
      handlerModules.forEach(moduleName => {
        const fun = handlers[moduleName];
        if (fun.__isHandler__) {
          orderList.push(moduleName);
        } else {
          orderList.unshift(moduleName);
        }
      });
      const moduleNameMap: {[key: string]: boolean} = {};
      const promiseResults: Promise<any>[] = [];
      orderList.forEach(moduleName => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          const fun = handlers[moduleName];
          const effectResult = fun(getActionData(action));
          const decorators = fun.__decorators__;
          if (decorators) {
            const results: any[] = [];
            decorators.forEach((decorator, index) => {
              results[index] = decorator[0](action, moduleName, effectResult);
            });
            fun.__decoratorResults__ = results;
          }

          effectResult.then(
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
            (reject: any) => {
              if (decorators) {
                const results = fun.__decoratorResults__ || [];
                decorators.forEach((decorator, index) => {
                  if (decorator[1]) {
                    decorator[1]('Rejected', results[index], reject);
                  }
                });
                fun.__decoratorResults__ = undefined;
              }
            }
          );
          promiseResults.push(effectResult);
        }
      });
      if (promiseResults.length) {
        return Promise.all(promiseResults);
      }
    }
    return action;
  };

  const preLoadMiddleware = () => (next: Function) => (action: Action) => {
    const [moduleName, actionName] = action.type.split(NSP);
    if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
      const initModel = injectModel(MetaData.moduleGetter, moduleName, store);
      if (isPromise(initModel)) {
        return initModel.then(() => next(action));
      }
    }
    return next(action);
  };
  const middlewareEnhancer = applyMiddleware(preLoadMiddleware, ...storeMiddlewares, middleware);
  const enhancer: StoreEnhancer = newCreateStore => {
    return (...args) => {
      const newStore = newCreateStore(...args);
      const modelStore: ModelStore = newStore as any;
      modelStore._medux_ = {
        prevState: {router: null},
        currentState: {router: null},
        reducerMap: {},
        effectMap: {},
        injectedModules: {},
        currentViews: {},
      };
      return newStore;
    };
  };
  const enhancers = [...storeEnhancers, middlewareEnhancer, enhancer];
  if (MetaData.isDev && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }
  store = createStore(combineReducers as any, preloadedState, compose(...enhancers));
  MetaData.clientStore = store;
  if (client) {
    if ('onerror' in client) {
      client.addEventListener(
        'error',
        event => {
          store.dispatch(errorAction(event));
        },
        true
      );
    }
    if ('onunhandledrejection' in client) {
      client.addEventListener(
        'unhandledrejection',
        event => {
          store.dispatch(errorAction(event.reason));
        },
        true
      );
    }
  }
  return store;
}
