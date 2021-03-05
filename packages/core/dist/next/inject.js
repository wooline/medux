import _decorate from "@babel/runtime/helpers/esm/decorate";
import { env } from './env';
import { MetaData, config, reducer, isPromise, mergeState } from './basic';
import { moduleInitAction, moduleReInitAction } from './actions';
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
}
export let CoreModuleHandlers = _decorate(null, function (_initialize) {
  class CoreModuleHandlers {
    constructor(initState) {
      _initialize(this);

      this.initState = initState;
    }

  }

  return {
    F: CoreModuleHandlers,
    d: [{
      kind: "field",
      key: "actions",
      value: void 0
    }, {
      kind: "field",
      key: "store",
      value: void 0
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
        return this.store._medux_.realtimeState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.store._medux_.realtimeState;
      }
    }, {
      kind: "method",
      key: "getCurrentActionName",
      value: function getCurrentActionName() {
        return MetaData.currentData.actionName;
      }
    }, {
      kind: "get",
      key: "prevRootState",
      value: function prevRootState() {
        return MetaData.currentData.prevState;
      }
    }, {
      kind: "get",
      key: "prevState",
      value: function prevState() {
        return MetaData.currentData.prevState[this.moduleName];
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
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
        return mergeState(this.state, payload);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Loading",
      value: function Loading(payload) {
        const loading = mergeState(this.state.loading, payload);
        return mergeState(this.state, {
          loading
        });
      }
    }]
  };
});
export const exportModule = (moduleName, ModuleHandles, views) => {
  const model = store => {
    const hasInjected = store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = true;
      const moduleHandles = new ModuleHandles();
      moduleHandles.moduleName = moduleName;
      moduleHandles.store = store;
      moduleHandles.actions = MetaData.facadeMap[moduleName].actions;
      const initState = moduleHandles.initState;
      injectActions(store, moduleName, moduleHandles);
      const preModuleState = store.getState()[moduleName] || {};
      const moduleState = { ...initState,
        ...preModuleState
      };

      if (moduleState.initialized) {
        return store.dispatch(moduleReInitAction(moduleName, moduleState));
      }

      moduleState.initialized = true;
      return store.dispatch(moduleInitAction(moduleName, moduleState));
    }

    return undefined;
  };

  return {
    moduleName,
    model,
    views,
    initState: undefined,
    actions: undefined
  };
};
export function getModuleByName(moduleName) {
  const result = MetaData.moduleGetter[moduleName]();

  if (isPromise(result)) {
    return result.then(module => {
      cacheModule(module);
      return module;
    });
  }

  cacheModule(result);
  return result;
}
export function getView(moduleName, viewName) {
  const callback = module => {
    const view = module.default.views[viewName];

    if (env.isServer) {
      return view;
    }

    module.default.model(MetaData.clientStore);
    return view;
  };

  const moduleOrPromise = getModuleByName(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(callback);
  }

  return callback(moduleOrPromise);
}

function _loadModel(moduleName, store) {
  const moduleOrPromise = getModuleByName(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(module => module.default.model(store));
  }

  return moduleOrPromise.default.model(store);
}

export { _loadModel as loadModel };