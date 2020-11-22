import _decorate from "@babel/runtime/helpers/esm/decorate";
import { MetaData, config, reducer, isPromise } from './basic';
import { moduleInitAction } from './actions';
import { isServerEnv } from './env';
export function cacheModule(module) {
  const moduleName = module.default.moduleName;
  const moduleGetter = MetaData.moduleGetter;
  let fn = moduleGetter[moduleName];

  if (fn.__module__ === module) {
    return fn;
  }

  fn = () => module;

  fn.__module__ = module;
  moduleGetter[moduleName] = fn;
  return fn;
}
export function getClientStore() {
  return MetaData.clientStore;
}

function bindThis(fun, thisObj) {
  const newFun = fun.bind(thisObj);
  Object.keys(fun).forEach(key => {
    newFun[key] = fun[key];
  });
  return newFun;
}

function transformAction(actionName, action, listenerModule, actionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error(`Action duplicate or conflict : ${actionName}.`);
  }

  actionHandlerMap[actionName][listenerModule] = action;
}

export function injectActions(store, moduleName, handlers) {
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      let handler = handlers[actionNames];

      if (handler.__isReducer__ || handler.__isEffect__) {
        handler = bindThis(handler, handlers);
        actionNames.split(config.MSP).forEach(actionName => {
          actionName = actionName.trim().replace(new RegExp(`^this\[${config.NSP}]`), `${moduleName}${config.NSP}`);
          const arr = actionName.split(config.NSP);

          if (arr[1]) {
            handler.__isHandler__ = true;
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
          } else {
            handler.__isHandler__ = false;
            transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
          }
        });
      }
    }
  }

  return MetaData.actionCreatorMap[moduleName];
}

function _loadModel(moduleName, store) {
  const hasInjected = !!store._medux_.injectedModules[moduleName];

  if (!hasInjected) {
    const moduleGetter = MetaData.moduleGetter;
    const result = moduleGetter[moduleName]();

    if (isPromise(result)) {
      return result.then(module => {
        cacheModule(module);
        return module.default.model(store);
      });
    }

    cacheModule(result);
    return result.default.model(store);
  }

  return undefined;
}

export { _loadModel as loadModel };
export let CoreModuleHandlers = _decorate(null, function (_initialize) {
  class CoreModuleHandlers {
    constructor(initState) {
      this.initState = initState;

      _initialize(this);
    }

  }

  return {
    F: CoreModuleHandlers,
    d: [{
      kind: "field",
      key: "actions",

      value() {
        return null;
      }

    }, {
      kind: "field",
      key: "store",

      value() {
        return null;
      }

    }, {
      kind: "field",
      key: "moduleName",

      value() {
        return '';
      }

    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.store._medux_.prevState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.store._medux_.prevState;
      }
    }, {
      kind: "get",
      key: "currentState",
      value: function currentState() {
        return this.store._medux_.currentState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "currentRootState",
      value: function currentRootState() {
        return this.store._medux_.currentState;
      }
    }, {
      kind: "get",
      key: "prevState",
      value: function prevState() {
        return this.store._medux_.beforeState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "prevRootState",
      value: function prevRootState() {
        return this.store._medux_.beforeState;
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
      }
    }, {
      kind: "method",
      key: "callThisAction",
      value: function callThisAction(handler, ...rest) {
        const actions = MetaData.actionCreatorMap[this.moduleName];
        return actions[handler.__actionName__](...rest);
      }
    }, {
      kind: "method",
      key: "updateState",
      value: function updateState(payload, key) {
        this.dispatch(this.callThisAction(this.Update, Object.assign({}, this.state, payload), key));
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel(moduleName) {
        return _loadModel(moduleName, this.store);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Update",
      value: function Update(payload, key) {
        return payload;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Loading",
      value: function Loading(payload) {
        const state = this.state;
        return Object.assign({}, state, {
          loading: Object.assign({}, state.loading, payload)
        });
      }
    }]
  };
});
export const exportModule = (moduleName, ModuleHandles, views) => {
  const model = store => {
    let initState = store._medux_.injectedModules[moduleName];

    if (!initState) {
      const moduleHandles = new ModuleHandles();
      moduleHandles.moduleName = moduleName;
      moduleHandles.store = store;
      initState = moduleHandles.initState;
      store._medux_.injectedModules[moduleName] = initState;
      const actions = injectActions(store, moduleName, moduleHandles);
      moduleHandles.actions = actions;
      const preModuleState = store.getState()[moduleName] || {};
      const moduleState = Object.assign({}, initState, preModuleState);

      if (!moduleState.initialized) {
        moduleState.initialized = true;
        return store.dispatch(moduleInitAction(moduleName, moduleState));
      }
    }

    return initState;
  };

  return {
    moduleName,
    model,
    views,
    initState: undefined,
    actions: undefined
  };
};
export function getView(moduleName, viewName) {
  const moduleGetter = MetaData.moduleGetter;
  const result = moduleGetter[moduleName]();

  if (isPromise(result)) {
    return result.then(module => {
      cacheModule(module);
      const view = module.default.views[viewName];

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
  const view = result.default.views[viewName];

  if (isServerEnv) {
    return view;
  }

  const initModel = result.default.model(MetaData.clientStore);

  if (isPromise(initModel)) {
    return initModel.then(() => view);
  }

  return view;
}
export function getModuleByName(moduleName, moduleGetter) {
  const result = moduleGetter[moduleName]();

  if (isPromise(result)) {
    return result.then(module => {
      cacheModule(module);
      return module;
    });
  }

  cacheModule(result);
  return result;
}