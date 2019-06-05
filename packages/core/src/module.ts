import {Middleware, ReducersMapObject, StoreEnhancer, Store} from 'redux';
import {Action, ActionHandler, ActionCreatorList, reducer, getModuleActionCreatorList, ModelStore, BaseModuleState, isPromise, injectActions, MetaData} from './basic';
import {buildStore} from './store';
import {errorAction} from './actions';

export interface Model<ModuleState extends BaseModuleState = BaseModuleState> {
  moduleName: string;
  initState: ModuleState;
  (store: ModelStore): Promise<void>;
}

export interface Module<M extends Model = Model, VS extends {[key: string]: any} = {[key: string]: any}> {
  moduleName: string;
  model: M;
  views: VS;
}
export type GetModule<M extends Module = Module> = () => M | Promise<M>;

export interface ModuleGetter {
  [moduleName: string]: GetModule;
}
export type ReturnModule<T extends () => any> = T extends () => Promise<infer R> ? R : T extends () => infer R ? R : never;
export type ReturnViews<T extends () => any> = T extends () => Promise<Module<Model, infer R>> ? R : never;
type ModuleStates<M extends any> = M['model']['initState'];
type ModuleViews<M extends any> = {[key in keyof M['views']]?: number};

export type RootState<G extends ModuleGetter = {}> = {
  views: {[key in keyof G]?: ModuleViews<ReturnModule<G[key]>>};
} & {[key in keyof G]?: ModuleStates<ReturnModule<G[key]>>};

export function exportFacade<T extends ActionCreatorList, N extends string>(moduleName: N) {
  const actions: T = getModuleActionCreatorList(moduleName) as T;
  return {
    moduleName,
    actions,
  };
}
export function exportModule<M extends Model, V, N extends string>(moduleName: N, model: M, views: V): Module<M, V> {
  return {
    moduleName,
    model,
    views,
  };
}
export class BaseModuleHandlers<S extends BaseModuleState, R extends RootState> {
  protected readonly initState: S;
  protected readonly moduleName: string = '';
  protected readonly store: ModelStore = null as any;
  protected readonly actions: Actions<this> = null as any;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(initState: S, presetData?: any) {
    initState.isModule = true;
    this.initState = initState;
  }

  protected get state(): S {
    return this.store._medux_.prevState[this.moduleName];
  }

  protected get rootState(): R {
    return this.store._medux_.prevState as R;
  }

  protected get currentState(): S {
    return this.store._medux_.currentState[this.moduleName];
  }

  protected get currentRootState(): R {
    return this.store._medux_.currentState as R;
  }

  protected dispatch(action: Action): Action | Promise<void> {
    return this.store.dispatch(action) as any;
  }

  protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {type: string; playload?: any} {
    const actions = getModuleActionCreatorList(this.moduleName);
    return actions[(handler as ActionHandler).__actionName__](rest[0]);
  }

  @reducer
  protected INIT(payload: S): S {
    return payload;
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
}

type Handler<F> = F extends (...args: infer P) => any
  ? (
      ...args: P
    ) => {
      type: string;
    }
  : never;

export type Actions<Ins> = {[K in keyof Ins]: Ins[K] extends (...args: any[]) => any ? Handler<Ins[K]> : never};
export function exportModel<S extends BaseModuleState>(
  HandlersClass: {new (initState: S, presetData?: any): BaseModuleHandlers<BaseModuleState, RootState>},
  initState: S
): (moduleName: string) => Model<S> {
  return (moduleName: string) => {
    const fun = (store: ModelStore) => {
      const hasInjected = store._medux_.injectedModules[moduleName];
      if (!hasInjected) {
        store._medux_.injectedModules[moduleName] = true;
        const moduleState: BaseModuleState = store.getState()[moduleName];
        const handlers = new HandlersClass(initState, moduleState);
        (handlers as any).moduleName = moduleName;
        (handlers as any).store = store;
        const actions = injectActions(store, moduleName, handlers as any);
        (handlers as any).actions = actions;
        if (!moduleState) {
          const initAction = actions.INIT((handlers as any).initState);
          const action = store.dispatch(initAction);
          if (isPromise(action)) {
            return action;
          } else {
            return Promise.resolve(void 0);
          }
        } else {
          return Promise.resolve(void 0);
        }
      } else {
        return Promise.resolve(void 0);
      }
    };
    fun.moduleName = moduleName;
    fun.initState = initState;
    return fun;
  };
}
export function isPromiseModule(module: Module | Promise<Module>): module is Promise<Module> {
  return typeof module['then'] === 'function';
}
export function isPromiseView<T>(moduleView: T | Promise<T>): moduleView is Promise<T> {
  return typeof moduleView['then'] === 'function';
}
export function loadModel<M extends Module>(getModule: GetModule<M>): Promise<M['model']> {
  const result = getModule();
  if (isPromiseModule(result)) {
    return result.then(module => module.model);
  } else {
    return Promise.resolve(result.model);
  }
}
export function getView<M extends Module, N extends Extract<keyof M['views'], string>>(getModule: GetModule<M>, viewName: N): M['views'][N] | Promise<M['views'][N]> {
  const result = getModule();
  if (isPromiseModule(result)) {
    return result.then(module => module.views[viewName]);
  } else {
    return result.views[viewName];
  }
}
export type ExportView<C> = (ComponentView: C, model: Model, viewName: string) => C;

export type LoadView = <MG extends ModuleGetter, M extends Extract<keyof MG, string>, V extends ReturnViews<MG[M]>, N extends Extract<keyof V, string>>(
  moduleGetter: MG,
  moduleName: M,
  viewName: N
) => V[N];

function getModuleByName(moduleName: string, moduleGetter: ModuleGetter): Promise<Module> | Module {
  const result = moduleGetter[moduleName]();
  if (isPromiseModule(result)) {
    return result.then(module => {
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
  storeOptions: StoreOptions = {}
): Promise<void> {
  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  let initData = {};
  if (storeOptions.initData || window[ssrInitStoreKey]) {
    initData = {...window[ssrInitStoreKey], ...storeOptions.initData};
  }
  const store = buildStore(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const preModuleNames: string[] = [appModuleName];
  if (initData) {
    preModuleNames.push(...Object.keys(initData).filter(key => key !== appModuleName && initData[key].isModule));
  }
  return getModuleListByNames(preModuleNames, moduleGetter).then(([appModule]) => {
    const initModel = appModule.model(store);
    render(store as any, appModule.model, appModule.views, ssrInitStoreKey);
    return initModel;
  });
}
export function renderSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  render: (store: Store, appModel: Model, appViews: {[key: string]: any}, ssrInitStoreKey: string) => {html: any; data: any; ssrInitStoreKey: string},
  moduleGetter: M,
  appModuleName: A,
  storeOptions: StoreOptions = {}
) {
  MetaData.appModuleName = appModuleName;
  const ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  const store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  const appModule = moduleGetter[appModuleName]() as Module;

  return appModule
    .model(store)
    .catch(err => {
      return store.dispatch(errorAction(err));
    })
    .then(() => {
      return render(store as any, appModule.model, appModule.views, ssrInitStoreKey);
    });
}
