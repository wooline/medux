import {Action, ActionHandler, ActionHandlerMap, CoreModuleState, CoreRootState, MetaData, Module, ModuleModel, ModuleGetter, ModelStore, config, reducer, isPromise} from './basic';
import {moduleInitAction} from './actions';
import {isServerEnv} from './env';

export interface ActionHandlerList {
  [actionName: string]: ActionHandler;
}

export interface CommonModule {
  default: {
    moduleName: string;
    model: {
      moduleName: string;
      initState: any;
      (store: any, options?: any): void | Promise<void>;
    };
    views: {[key: string]: any};
    actions: {
      [actionName: string]: (...args: any[]) => Action;
    };
  };
}

export function cacheModule<T extends CommonModule>(module: T): () => T {
  const moduleName = module.default.moduleName;
  const moduleGetter: ModuleGetter = MetaData.moduleGetter;
  let fn = moduleGetter[moduleName] as any;
  if (fn.__module__ === module) {
    return fn;
  }
  fn = () => module;
  fn.__module__ = module;
  moduleGetter[moduleName] = fn;
  return fn;
}

/**
 * 在client中运行时，全局只有一个单例的Store对象，可通过该方法直接获得
 */
export function getClientStore() {
  return MetaData.clientStore;
}

function bindThis(fun: ActionHandler, thisObj: any) {
  const newFun = fun.bind(thisObj);
  Object.keys(fun).forEach((key) => {
    newFun[key] = fun[key];
  });

  return newFun as ActionHandler;
}
function transformAction(actionName: string, action: ActionHandler, listenerModule: string, actionHandlerMap: ActionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error(`Action duplicate or conflict : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = action;
}

function addModuleActionCreatorList(moduleName: string, actionName: string) {
  const actions = MetaData.actionCreatorMap[moduleName];
  if (!actions[actionName]) {
    actions[actionName] = (...payload: any[]) => ({type: moduleName + config.NSP + actionName, payload});
  }
}
export function injectActions(store: ModelStore, moduleName: string, handlers: ActionHandlerList) {
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      let handler = handlers[actionNames];
      if (handler.__isReducer__ || handler.__isEffect__) {
        handler = bindThis(handler, handlers);
        actionNames.split(config.MSP).forEach((actionName) => {
          // eslint-disable-next-line no-useless-escape
          actionName = actionName.trim().replace(new RegExp(`^this\[${config.NSP}]`), `${moduleName}${config.NSP}`);
          const arr = actionName.split(config.NSP);
          if (arr[1]) {
            handler.__isHandler__ = true;
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
          } else {
            handler.__isHandler__ = false;
            transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
            addModuleActionCreatorList(moduleName, actionName);
          }
        });
      }
    }
  }
  return MetaData.actionCreatorMap[moduleName];
}

type Handler<F> = F extends (...args: infer P) => any
  ? (
      ...args: P
    ) => {
      type: string;
    }
  : never;
/**
 * 将ModuleHandlers变成Action Creator
 * - 该数据结构由ExportModule自动生成
 * - medux中的action通常都由此Creator自动生成
 */
export type Actions<Ins> = {[K in keyof Ins]: Ins[K] extends (...args: any[]) => any ? Handler<Ins[K]> : never};

/**
 * 动态加载并初始化其他模块的model
 * @param moduleName 要加载的模块名
 * @param store 当前Store的引用
 * @param options model初始化时可以传入的数据，参见Model接口
 */
export function loadModel<MG extends ModuleGetter>(moduleName: Extract<keyof MG, string>, store: ModelStore): void | Promise<void> {
  const hasInjected = !!store._medux_.injectedModules[moduleName];
  if (!hasInjected) {
    const moduleGetter = MetaData.moduleGetter;
    const result = moduleGetter[moduleName]();
    if (isPromise(result)) {
      return result.then((module) => {
        cacheModule(module);
        return module.default.model(store);
      });
    }
    cacheModule(result);
    return result.default.model(store);
  }
  return undefined;
}

/**
 * ModuleHandlers基类
 * 所有ModuleHandlers必须继承此基类
 */
export abstract class CoreModelHandlers<S extends CoreModuleState, R extends CoreRootState> {
  /**
   * - 引用本module的actions
   * - this.actions相当于actions[this.moduleName]
   */
  protected readonly actions: Actions<this>;

  /**
   * 构造函数的参数将由框架自动传入
   * @param moduleName 模块名称，不能重复
   * @param store 全局单例Store的引用
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(public readonly moduleName: string, public readonly initState: S, protected readonly store: ModelStore) {
    this.actions = null as any;
  }

  /**
   * 获取本Model的state
   */
  protected get state(): S {
    return this.getState();
  }

  /**
   * ie8不支持getter专用
   */
  protected getState(): S {
    return this.store._medux_.prevState[this.moduleName] as S;
  }

  /**
   * 获取整个store的state
   */
  protected get rootState(): R {
    return this.getRootState();
  }

  /**
   * ie8不支持getter专用
   */
  protected getRootState(): R {
    return this.store._medux_.prevState as any;
  }

  /**
   * - 获取本Model的实时state，通常在reducer中使用，当一个action引起多个不同模块reducer执行时：
   * - state会等到所有模块的reducer更新完成时才变化
   * - currentState是实时更新变化
   */
  protected get currentState(): S {
    return this.getCurrentState();
  }

  /**
   * ie8不支持getter专用
   */
  protected getCurrentState(): S {
    return this.store._medux_.currentState[this.moduleName] as S;
  }

  /**
   * 获取整个store的实时state，通常在reducer中使用，当一个action引起多个不同模块reducer执行时：
   * - state会等到所有模块的reducer更新完成时才变化
   * - currentState是实时更新变化
   */
  protected get currentRootState(): R {
    return this.getCurrentRootState();
  }

  /**
   * ie8不支持getter专用
   */
  protected getCurrentRootState(): R {
    return this.store._medux_.currentState as any;
  }

  /**
   * 获取本Model的前state状态，通常在effect中使用，当一个action同时引起reducer和effect执行时：
   * - 所有reducer会先执行完毕并更新rootState
   * - 之后才开始执行effect，此时effect中取到的rootState已经被reducer变更了
   * - 使用prevState可以取到reducer变更之前的state
   */
  protected get prevState(): undefined | S {
    return this.getPrevState();
  }

  /**
   * ie8不支持getter专用
   */
  protected getPrevState(): undefined | S {
    return this.store._medux_.beforeState[this.moduleName] as S;
  }

  /**
   * 获整个store的前state状态，通常在effect中使用，
   * 当一个action同时引起reducer和effect执行时：
   * - 所有reducer会先执行完毕并更新rootState
   * - 之后才开始执行effect，此时effect中取到的rootState已经被reducer变更了
   * - 使用prevState可以取到reducer变更之前的state
   */
  protected get prevRootState(): R {
    return this.getPrevRootState();
  }

  /**
   * ie8不支持getter专用
   */
  protected getPrevRootState(): R {
    return this.store._medux_.beforeState as any;
  }

  /**
   * store.dispatch的引用
   */
  protected dispatch(action: Action): Action | Promise<void> {
    return this.store.dispatch(action) as any;
  }

  /**
   * 对于某些仅供本模块内部使用的action，限制非public不对外开放.
   * 所以即使this.actions也调用不到，此时可以使用callThisAction.
   * ```
   * this.dispatch(this.callThisAction(this.anyPrivateHandle, args1, args2));
   * ```
   */
  protected callThisAction<T extends any[]>(handler: (...args: T) => any, ...rest: T): {type: string; payload?: any[]} {
    const actions = MetaData.actionCreatorMap[this.moduleName];
    return actions[(handler as ActionHandler).__actionName__](...rest);
  }

  /**
   * 一个快捷操作，相当于
   * ```
   * this.dispatch(this.actions.Update({...this.state,...args}));
   * ```
   */
  protected updateState(payload: Partial<S>, key: string) {
    this.dispatch(this.callThisAction(this.Update, {...this.getState(), ...payload}, key));
  }

  /**
   * 动态加载并初始化其他模块的model
   */
  protected loadModel(moduleName: string) {
    return loadModel(moduleName, this.store);
  }

  /**
   * - 模块被加载并初始化时将触发‘moduleName.Init’的action
   * - 此方法为该action的默认reducerHandler，通常用来注入初始化moduleState
   */
  @reducer
  protected Init(initState: S): S {
    return initState;
  }

  /**
   * 通用的reducerHandler，通常用来更新moduleState
   */
  @reducer
  protected Update(payload: S, key: string): S {
    return payload;
  }

  /**
   * - effect异步执行时，将自动派发‘moduleName.Loading’的action
   * - 此方法为该action的默认reducerHandler，通常用来在moduleState中注入loading状态
   */
  @reducer
  protected Loading(payload: {[group: string]: string}): S {
    const state = this.getState();
    return {
      ...state,
      loading: {...state.loading, ...payload},
    };
  }
}

/**
 * 导出Module
 * @param moduleName 模块名，不能重复
 * @param initState 模块初始状态
 * @param ActionHandles 模块的ModuleHandlers类，必须继承BaseModuleHandlers
 * @param views 模块需要导出给外部使用的View，若无需给外部使用可不导出
 * @returns medux定义的module标准数据结构
 */
export type ExportModule<Component> = <
  S extends CoreModuleState,
  V extends {
    [key: string]: Component;
  },
  T extends CoreModelHandlers<S, any>,
  N extends string
>(
  moduleName: N,
  initState: S,
  ActionHandles: {
    new (...args: any[]): T;
  },
  views: V
) => Module<ModuleModel<S>, V, Actions<T>, N>['default'];

/**
 * 导出Module，该方法为ExportModule接口的实现
 * @param moduleName 模块名，不能重复
 * @param initState 模块初始状态
 * @param ActionHandles 模块的ModuleHandlers类，必须继承CoreModelHandlers
 * @param views 模块需要导出给外部使用的View，若无需给外部使用可不导出
 * @returns medux定义的module标准数据结构
 */
export const exportModule: ExportModule<any> = (moduleName, initState, ActionHandles, views) => {
  const model = (store: ModelStore) => {
    const hasInjected = !!store._medux_.injectedModules[moduleName];
    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = initState;
      const handlers = new ActionHandles(moduleName, store);
      const actions = injectActions(store, moduleName, handlers as any);
      (handlers as any).actions = actions;
      const preModuleState: CoreModuleState = store.getState()[moduleName] || {};
      const moduleState: CoreModuleState = {...initState, ...preModuleState};
      if (!moduleState.initialized) {
        moduleState.initialized = true;
        return store.dispatch(moduleInitAction(moduleName, moduleState)) as any;
      }
      // const params = store._medux_.prevState.route?.data.params || {};
      // if (!moduleState) {
      //   moduleState = initState;
      //   moduleState.isModule = true;
      // } else {
      //   moduleState = {...moduleState, isHydrate: true};
      // }
    }
    return undefined;
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
/**
 * 动态获取View，与LoadView的区别是：
 * - getView仅获取view，并不渲染，与UI平台无关
 * - LoadView内部会调用getView之后会渲染View
 * - getView会自动加载并初始化该view对应的model
 */
export function getView<T>(moduleName: string, viewName: string): T | Promise<T> {
  const moduleGetter: ModuleGetter = MetaData.moduleGetter;
  const result = moduleGetter[moduleName]();
  if (isPromise(result)) {
    return result.then((module) => {
      cacheModule(module);
      const view: T = module.default.views[viewName];
      if (isServerEnv) {
        return view;
      }
      const initModel = module.default.model(MetaData.clientStore);
      if (isPromise(initModel)) {
        return initModel.then(() => view);
      }
      return view;
    });
  }
  cacheModule(result);
  const view: T = result.default.views[viewName];
  if (isServerEnv) {
    return view;
  }
  const initModel = result.default.model(MetaData.clientStore);
  if (isPromise(initModel)) {
    return initModel.then(() => view);
  }
  return view;
}
export function getModuleByName(moduleName: string, moduleGetter: ModuleGetter): Promise<Module> | Module {
  const result = moduleGetter[moduleName]();
  if (isPromise(result)) {
    return result.then((module) => {
      // 在SSR时loadView不能出现异步，否则浏览器初轮渲染不会包括异步组件，从而导致和服务器返回不一致
      cacheModule(module);
      return module;
    });
  }
  cacheModule(result);
  return result;
}
