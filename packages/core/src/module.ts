import {Action, ActionCreatorList, ActionHandler, BaseModelState, MetaData, ModelStore, RouteState, defaultRouteParams, injectActions, isPromise, reducer} from './basic';
import {ActionTypes, errorAction} from './actions';
import {HistoryProxy, buildStore} from './store';
import {Middleware, ReducersMapObject, Store, StoreEnhancer} from 'redux';

export interface Model<ModelState extends BaseModelState = BaseModelState> {
  moduleName: string;
  initState: ModelState;
  (store: ModelStore): void | Promise<void>;
}

export interface Module<M extends Model = Model, VS extends {[key: string]: any} = {[key: string]: any}, AS extends ActionCreatorList = {}, N extends string = string> {
  default: {
    moduleName: N;
    model: M;
    views: VS;
    actions: AS;
  };
}

export interface ModuleGetter {
  [moduleName: string]: () => Module | Promise<Module>;
}

type ReturnModule<T> = T extends () => Promise<infer R> ? R : T extends () => infer R ? R : never;
// export type ReturnViews<T extends () => any> = T extends () => Promise<Module<Model, infer R>> ? R : T extends () => Module<Model, infer R> ? R : never;
type ModuleName<M extends any> = M['default']['moduleName'];
type ModuleStates<M extends any> = M['default']['model']['initState'];
type ModuleParams<M extends any> = M['default']['model']['initState']['routeParams'];
type ModuleViews<M extends any> = M['default']['views'];
type ModuleActions<M extends any> = M['default']['actions'];
type MountViews<M extends any> = {[key in keyof M['default']['views']]?: boolean};
export type RootState<G extends ModuleGetter, L> = {
  route: {
    location: L;
    data: {
      views: {[key in keyof G]?: MountViews<ReturnModule<G[key]>>};
      params: {[key in keyof G]?: ModuleParams<ReturnModule<G[key]>>};
      paths: any;
    };
  };
} & {[key in keyof G]?: ModuleStates<ReturnModule<G[key]>>};

export type ExportModule<Component> = <S extends BaseModelState, V extends {[key: string]: Component}, T extends BaseModelHandlers<S, any>, N extends string>(
  moduleName: N,
  initState: S,
  ActionHandles: {new (moduleName: string, store: any, initState: any, presetData?: any): T},
  views: V
) => Module<Model<S>, V, Actions<T>, N>['default'];

export const exportModule: ExportModule<any> = (moduleName, initState, ActionHandles, views) => {
  defaultRouteParams[moduleName] = initState.routeParams;
  const model = (store: ModelStore) => {
    const hasInjected = store._medux_.injectedModules[moduleName];
    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = true;
      const moduleState: BaseModelState = store.getState()[moduleName];
      const handlers = new ActionHandles(moduleName, store, initState, moduleState);
      const actions = injectActions(store, moduleName, handlers as any);
      (handlers as any).actions = actions;
      if (!moduleState) {
        const params = (handlers.rootState.route as RouteState).data.params || {};
        const initAction = actions.INIT({...initState, routeParams: params[moduleName]});
        const result = store.dispatch(initAction);
        if (isPromise(result)) {
          return result
            .catch(err => {
              return store.dispatch(errorAction(err)) as any;
            })
            .then(() => void 0);
        }
      }
    }
    return void 0;
  };
  model.moduleName = moduleName;
  model.initState = initState;
  const actions = {} as any;
  return {
    moduleName,
    model,
    views,
    actions,
  };
};

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
export abstract class BaseModelHandlers<S extends BaseModelState, R> {
  protected readonly actions: Actions<this> = null as any;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(protected readonly moduleName: string, protected readonly store: ModelStore, protected readonly initState: S, presetData?: any) {
    initState.isModule = true;
  }

  public get state(): S {
    return this.store._medux_.prevState[this.moduleName];
  }

  public get rootState(): R {
    return this.store._medux_.prevState as R;
  }

  public get currentState(): S {
    return this.store._medux_.currentState[this.moduleName];
  }

  public get currentRootState(): R {
    return this.store._medux_.currentState as R;
  }

  protected dispatch(action: Action): Action | Promise<void> {
    return this.store.dispatch(action) as any;
  }

  protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {type: string; playload?: any} {
    const actions = MetaData.actionCreatorMap[this.moduleName];
    return actions[(handler as ActionHandler).__actionName__](rest[0]);
  }

  protected mergeRouteState(state: S, routeData: RouteState): S {
    if (routeData.data.views[this.moduleName]) {
      const routeParams = routeData.data.params[this.moduleName];
      if (!simpleEqual(routeParams, state.routeParams)) {
        return {...state, routeParams: routeParams};
      }
    }
    return state;
  }
  @reducer
  protected INIT(payload: S): S {
    return this.mergeRouteState(payload, this.rootState['route']);
  }

  @reducer
  protected UPDATE(payload: S): S {
    return payload;
  }

  @reducer
  protected LOADING(payload: {[group: string]: string}): S {
    const state = this.state;
    if (!state) {
      return state;
    }
    return {
      ...state,
      loading: {...state.loading, ...payload},
    };
  }

  protected updateState(payload: Partial<S>) {
    this.dispatch(this.callThisAction(this.UPDATE, {...this.state, ...payload}));
  }

  @reducer
  protected [ActionTypes.F_ROUTE_CHANGE](routeData: RouteState): S {
    return this.mergeRouteState(this.state, routeData);
  }
}

type Handler<F> = F extends (...args: infer P) => any
  ? (
      ...args: P
    ) => {
      type: string;
    }
  : never;

export type Actions<Ins> = {[K in keyof Ins]: Ins[K] extends (...args: any[]) => any ? Handler<Ins[K]> : never};

export function isPromiseModule(module: Module | Promise<Module>): module is Promise<Module> {
  return typeof module['then'] === 'function';
}
export function isPromiseView<T>(moduleView: T | Promise<T>): moduleView is Promise<T> {
  return typeof moduleView['then'] === 'function';
}

export function exportActions<G extends {[N in keyof G]: N extends ModuleName<ReturnModule<G[N]>> ? G[N] : never}>(moduleGetter: G): {[key in keyof G]: ModuleActions<ReturnModule<G[key]>>} {
  MetaData.moduleGetter = moduleGetter as any;
  MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce((maps, moduleName) => {
    maps[moduleName] =
      typeof Proxy === 'undefined'
        ? {}
        : new Proxy(
            {},
            {
              get: (target: {}, key: string) => {
                return (payload: any) => ({type: moduleName + '/' + key, payload});
              },
              set: () => {
                return true;
              },
            }
          );
    return maps;
  }, {});
  return MetaData.actionCreatorMap as any;
}

export function injectModel<MG extends ModuleGetter, N extends Extract<keyof MG, string>>(moduleGetter: MG, moduleName: N, store: ModelStore): void | Promise<void> {
  const hasInjected = store._medux_.injectedModules[moduleName];
  if (!hasInjected) {
    moduleGetter = MetaData.moduleGetter as any;
    const result = moduleGetter[moduleName]();
    if (isPromiseModule(result)) {
      return result.then(module => {
        moduleGetter[moduleName] = (() => module) as any;
        return module.default.model(store);
      });
    } else {
      return result.default.model(store);
    }
  }
}

export function getView<T>(moduleGetter: ModuleGetter, moduleName: string, viewName: string): T | Promise<T> {
  moduleGetter = MetaData.moduleGetter;
  const result = moduleGetter[moduleName]();
  if (isPromiseModule(result)) {
    return result.then(module => {
      moduleGetter[moduleName] = () => module;
      const view: T = module.default.views[viewName];
      if (MetaData.isServer) {
        return view;
      }
      const initModel = module.default.model(MetaData.clientStore);
      if (isPromise(initModel)) {
        return initModel.then(() => view);
      } else {
        return view;
      }
    });
  } else {
    const view: T = result.default.views[viewName];
    if (MetaData.isServer) {
      return view;
    }
    const initModel = result.default.model(MetaData.clientStore);
    if (isPromise(initModel)) {
      return initModel.then(() => view);
    } else {
      return view;
    }
  }
}

export type LoadView = <MG extends ModuleGetter, M extends Extract<keyof MG, string>, V extends ModuleViews<ReturnModule<MG[M]>>, N extends Extract<keyof V, string>>(
  moduleGetter: MG,
  moduleName: M,
  viewName: N
) => V[N];

function getModuleByName(moduleName: string, moduleGetter: ModuleGetter): Promise<Module> | Module {
  const result = moduleGetter[moduleName]();
  if (isPromiseModule(result)) {
    return result.then(module => {
      //在SSR时loadView不能出现异步，否则浏览器初轮渲染不会包括异步组件，从而导致和服务器返回不一致
      moduleGetter[moduleName] = () => module;
      return module;
    });
  } else {
    return result;
  }
}
function getModuleListByNames(moduleNames: string[], moduleGetter: ModuleGetter): Promise<Module[]> {
  const preModules = moduleNames.map(moduleName => {
    const module = getModuleByName(moduleName, moduleGetter);
    if (isPromiseModule(module)) {
      return module;
    } else {
      return Promise.resolve(module);
    }
  });
  return Promise.all(preModules);
}
export interface StoreOptions {
  ssrInitStoreKey?: string;
  reducers?: ReducersMapObject;
  middlewares?: Middleware[];
  enhancers?: StoreEnhancer[];
  initData?: {[key: string]: any};
}

export function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  render: (store: Store, appModel: Model, appViews: {[key: string]: any}, ssrInitStoreKey: string) => void,
  moduleGetter: M,
  appModuleName: A,
  history: HistoryProxy,
  storeOptions: StoreOptions = {}
): Promise<void> {
  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  let initData = {};
  if (storeOptions.initData || window[ssrInitStoreKey]) {
    initData = {...window[ssrInitStoreKey], ...storeOptions.initData};
  }
  const store = buildStore(history, initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const preModuleNames: string[] = [appModuleName];
  if (initData) {
    preModuleNames.push(...Object.keys(initData).filter(key => key !== appModuleName && initData[key].isModule));
  }
  return getModuleListByNames(preModuleNames, moduleGetter).then(([appModule]) => {
    const initModel = appModule.default.model(store);
    render(store as any, appModule.default.model, appModule.default.views, ssrInitStoreKey);
    return initModel;
  });
}
export function renderSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  render: (store: Store, appModel: Model, appViews: {[key: string]: any}, ssrInitStoreKey: string) => {html: any; data: any; ssrInitStoreKey: string},
  moduleGetter: M,
  appModuleName: A,
  history: HistoryProxy,
  storeOptions: StoreOptions = {}
) {
  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  const store = buildStore(history, storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const appModule = moduleGetter[appModuleName]() as Module;
  let initAppModel = appModule.default.model(store);
  if (!isPromise(initAppModel)) {
    initAppModel = Promise.resolve();
  }
  return initAppModel.then(() => {
    return render(store as any, appModule.default.model, appModule.default.views, ssrInitStoreKey);
  });
}
