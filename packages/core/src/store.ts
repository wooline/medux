import {Action, ActionTypes, MetaData, ModelStore, RouteData, RouteState, StoreState, cacheModule, config, isProcessedError, isPromise, setProcessedError} from './basic';
import {Middleware, ReducersMapObject, StoreEnhancer, applyMiddleware, compose, createStore} from 'redux';
import {Module, ModuleGetter} from './module';
import {client, isDevelopmentEnv, isServerEnv} from './env';
import {errorAction, routeChangeAction, routeParamsAction} from './actions';

function isPromiseModule(module: Module | Promise<Module>): module is Promise<Module> {
  return typeof module['then'] === 'function';
}
/**
 * 动态加载并初始化其他模块的model
 * @param moduleName 要加载的模块名
 * @param store 当前Store的引用
 * @param options model初始化时可以传入的数据，参见Model接口
 */
export function loadModel<MG extends ModuleGetter>(moduleName: Extract<keyof MG, string>, storeInstance?: ModelStore, options?: any): void | Promise<void> {
  const store = storeInstance || MetaData.clientStore;
  const hasInjected = !!store._medux_.injectedModules[moduleName];
  if (!hasInjected) {
    const moduleGetter = MetaData.moduleGetter;
    const result = moduleGetter[moduleName]();
    if (isPromiseModule(result)) {
      return result.then((module) => {
        moduleGetter[moduleName] = cacheModule(module);
        return module.default.model(store, options);
      });
    } else {
      cacheModule(result, moduleGetter[moduleName]);
      return result.default.model(store, options);
    }
  }
}
/**
 * 从redux action上获取有效数据载体
 * @param action redux的action
 */
export function getActionData(action: Action): any[] {
  return Array.isArray(action.payload) ? action.payload : [];
}

/**
 * 路由抽象代理。
 * - 路由系统通常由宿主平台自己提供，由于各个平台的路由实现方式不同，为了支持跨平台使用，框架抽象了路由代理
 * - 该代理用来实现medux与宿主路由系统的对接
 */
export interface HistoryProxy<L = any> {
  /**
   * 是否初始化完成了，有些平台路由自动被初始化，如web。有些平台路由需要手动代理，如app
   */
  initialized: boolean;
  /**
   * 宿主路由系统的原始数据
   */
  getLocation(): L;
  /**
   * 监听宿主路由系统的变化
   * @returns 卸载监听
   */
  subscribe(listener: (location: L) => void): () => void;
  /**
   * 宿主路由系统的原始数据转换为medux的RouteData
   */
  locationToRouteData(location: L): RouteData;
  /**
   * 对比2个宿主路由系统的原始数据是否相同
   */
  equal(a: L, b: L): boolean;
  /**
   * - 通常情况下，宿主路由系统的变化引起应用的路由变化
   * - inTimeTravelling时，应用的路由变化反过来带动宿主路由系统的变化
   */
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
  store._medux_.destroy = history.subscribe(handleLocationChange);
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
  if (MetaData.clientStore) {
    MetaData.clientStore._medux_.destroy();
  }
  if (storeReducers.route) {
    throw new Error("the reducer name 'route' is not allowed");
  }
  storeReducers.route = (state: RouteState, action: Action) => {
    if (action.type === ActionTypes.RouteChange) {
      const payload: RouteState = getActionData(action)[0];
      if (!state) {
        return payload;
      }
      return {...state, ...payload};
    }
    return state;
  };

  const combineReducers = (rootState: StoreState, action: Action) => {
    if (!store) {
      return rootState;
    }
    const meta = store._medux_;
    meta.prevState = rootState;
    //const currentState = {...rootState};
    meta.currentState = rootState;
    Object.keys(storeReducers).forEach((moduleName) => {
      const result = storeReducers[moduleName](rootState[moduleName], action);
      if (result !== rootState[moduleName]) {
        meta.currentState = {...meta.currentState, [moduleName]: result};
      }
    });

    const handlersCommon = meta.reducerMap[action.type] || {};
    // 支持泛监听，形如 */loading
    const handlersEvery = meta.reducerMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = {...handlersCommon, ...handlersEvery};
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
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
      orderList.forEach((moduleName) => {
        if (!moduleNameMap[moduleName]) {
          moduleNameMap[moduleName] = true;
          const fun = handlers[moduleName];
          const result = fun(...getActionData(action));
          if (result !== rootState[moduleName]) {
            meta.currentState = {...meta.currentState, [moduleName]: result};
          }
        }
      });
    }

    const changed = Object.keys(rootState).length !== Object.keys(meta.currentState).length || Object.keys(rootState).some((moduleName) => rootState[moduleName] !== meta.currentState[moduleName]);
    meta.prevState = changed ? meta.currentState : rootState;
    return meta.prevState;
  };
  const middleware: Middleware = ({dispatch}) => (next) => (originalAction) => {
    if (isServerEnv) {
      if (originalAction.type.split(config.NSP)[1] === ActionTypes.MLoading) {
        return originalAction;
      }
    }
    const meta = store._medux_;
    meta.beforeState = meta.prevState;
    const action: Action = next(originalAction);
    if (action.type === ActionTypes.RouteChange) {
      const rootRouteParams = meta.prevState.route.data.params;
      Object.keys(rootRouteParams).forEach((moduleName) => {
        const routeParams = rootRouteParams[moduleName];
        if (routeParams && Object.keys(routeParams).length > 0 && meta.injectedModules[moduleName]) {
          dispatch(routeParamsAction(moduleName, routeParams));
        }
      });
    }
    const handlersCommon = meta.effectMap[action.type] || {};
    // 支持泛监听，形如 */loading
    const handlersEvery = meta.effectMap[action.type.replace(new RegExp(`[^${config.NSP}]+`), '*')] || {};
    const handlers = {...handlersCommon, ...handlersEvery};
    const handlerModules = Object.keys(handlers);

    if (handlerModules.length > 0) {
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
          const effectResult = fun(...getActionData(action));
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
                return dispatch(errorAction(error)) as any;
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
      const initModel = loadModel(moduleName, store, undefined);
      if (isPromise(initModel)) {
        return initModel.then(() => next(action));
      }
    }
    return next(action);
  };

  const middlewareEnhancer = applyMiddleware(preLoadMiddleware, ...storeMiddlewares, middleware);
  const enhancer: StoreEnhancer = (newCreateStore) => {
    return (...args) => {
      const newStore = newCreateStore(...args);
      const modelStore: ModelStore = newStore as any;
      modelStore._medux_ = {
        beforeState: {} as any,
        prevState: {} as any,
        currentState: {} as any,
        reducerMap: {},
        effectMap: {},
        injectedModules: {},
        destroy: () => void 0,
      };
      return newStore;
    };
  };
  const enhancers = [...storeEnhancers, middlewareEnhancer, enhancer];
  if (isDevelopmentEnv && client && client.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(client.__REDUX_DEVTOOLS_EXTENSION__(client.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }
  const store: ModelStore = createStore(combineReducers as any, preloadedState, compose(...enhancers));
  bindHistory(store, history);
  if (!isServerEnv) {
    MetaData.clientStore = store;
  }
  return store;
}
