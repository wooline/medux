import {Action, MetaData, ModelStore, RouteData, RouteState, StoreState, client, config, isProcessedError, isPromise, setProcessedError} from './basic';
import {ActionTypes, errorAction, routeChangeAction} from './actions';
import {Middleware, ReducersMapObject, StoreEnhancer, applyMiddleware, compose, createStore} from 'redux';

import {injectModel} from './module';

export function getActionData<T>(action: Action): T {
  const arr = Object.keys(action).filter(key => key !== 'type' && key !== 'priority' && key !== 'time');
  if (arr.length === 0) {
    return undefined as any;
  } else if (arr.length === 1) {
    return action[arr[0]];
  } else {
    const data = {...action};
    delete data['type'];
    delete data['priority'];
    delete data['time'];
    return data as any;
  }
}
export interface HistoryProxy<L = any> {
  initialized: boolean;
  getLocation(): L;
  subscribe(listener: (location: L) => void): void;
  locationToRouteData(location: L): RouteData;
  equal(a: L, b: L): boolean;
  patch(location: L, routeData: RouteData): void;
}

function bindHistory<L>(store: ModelStore, history: HistoryProxy<L>) {
  let inTimeTravelling = false;
  const handleLocationChange = (location: L) => {
    if (!inTimeTravelling) {
      const {route} = store.getState() as StoreState;
      if (route) {
        if (history.equal(route.location, location)) {
          return;
        }
      }
      const data = history.locationToRouteData(location);
      store.dispatch(routeChangeAction({location, data}));
    } else {
      inTimeTravelling = false;
    }
  };
  history.subscribe(handleLocationChange);
  store.subscribe(() => {
    if (history.initialized) {
      const storeRouteState = (store.getState() as StoreState).route;
      if (!history.equal(storeRouteState.location, history.getLocation())) {
        inTimeTravelling = true;
        history.patch(storeRouteState.location, storeRouteState.data);
      }
    }
  });
  history.initialized && handleLocationChange(history.getLocation());
}

export function buildStore(
  history: HistoryProxy<any>,
  preloadedState: {[key: string]: any} = {},
  storeReducers: ReducersMapObject<any, any> = {},
  storeMiddlewares: Middleware[] = [],
  storeEnhancers: StoreEnhancer[] = []
): ModelStore {
  if (storeReducers.route) {
    throw new Error("the reducer name 'route' is not allowed");
  }
  storeReducers.route = (state: RouteState, action: Action) => {
    if (action.type === ActionTypes.RouteChange) {
      const payload: RouteState = getActionData(action);
      if (!state) {
        return payload;
      }
      return {...state, ...payload};
    }
    return state;
  };
  let store: ModelStore;
  const combineReducers = (rootState: StoreState, action: Action) => {
    if (!store) {
      return rootState;
    }
    const meta = store._medux_;
    meta.prevState = rootState;
    const currentState = {...rootState};
    meta.currentState = currentState;
    Object.keys(storeReducers).forEach(moduleName => {
      currentState[moduleName] = storeReducers[moduleName](currentState[moduleName], action);
    });
    const handlersCommon = meta.reducerMap[action.type] || {};
    // 支持泛监听，形如 */loading
    const handlersEvery = meta.reducerMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = {...handlersCommon, ...handlersEvery};
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList: string[] = [];
      const priority: string[] = action.priority ? [...action.priority] : [];
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
      if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
        return originalAction;
      }
    }
    const prevState = store._medux_.prevState;
    const action: Action = next(originalAction);
    const handlersCommon = store._medux_.effectMap[action.type] || {};
    // 支持泛监听，形如 */loading
    const handlersEvery = store._medux_.effectMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = {...handlersCommon, ...handlersEvery};
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
      const orderList: string[] = [];
      const priority: string[] = action.priority ? [...action.priority] : [];
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
      const moduleNameMap: {[key: string]: boolean} = {};
      const promiseResults: Promise<any>[] = [];
      orderList.forEach(moduleName => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          const fun = handlers[moduleName];
          const effectResult = fun(getActionData(action), prevState);
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
            (error: any) => {
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
                return store.dispatch(errorAction(error)) as any;
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

  const preLoadMiddleware = () => (next: Function) => (action: Action) => {
    const [moduleName, actionName] = action.type.split(config.NSP);
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
        prevState: {} as any,
        currentState: {} as any,
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
  bindHistory(store, history);
  MetaData.clientStore = store;
  return store;
}
