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

function addModuleActionCreatorList(moduleName, actionName) {
  const actions = MetaData.actionCreatorMap[moduleName];

  if (!actions[actionName]) {
    actions[actionName] = (...payload) => ({
      type: moduleName + config.NSP + actionName,
      payload
    });
  }
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
            addModuleActionCreatorList(moduleName, actionName);
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
export let CoreModelHandlers = _decorate(null, function (_initialize) {
  class CoreModelHandlers {
    constructor(moduleName, store) {
      this.moduleName = moduleName;
      this.store = store;

      _initialize(this);

      this.actions = null;
    }

  }

  return {
    F: CoreModelHandlers,
    d: [{
      kind: "field",
      key: "actions",
      value: void 0
    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.getState();
      }
    }, {
      kind: "method",
      key: "getState",
      value: function getState() {
        return this.store._medux_.prevState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.getRootState();
      }
    }, {
      kind: "method",
      key: "getRootState",
      value: function getRootState() {
        return this.store._medux_.prevState;
      }
    }, {
      kind: "get",
      key: "currentState",
      value: function currentState() {
        return this.getCurrentState();
      }
    }, {
      kind: "method",
      key: "getCurrentState",
      value: function getCurrentState() {
        return this.store._medux_.currentState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "currentRootState",
      value: function currentRootState() {
        return this.getCurrentRootState();
      }
    }, {
      kind: "method",
      key: "getCurrentRootState",
      value: function getCurrentRootState() {
        return this.store._medux_.currentState;
      }
    }, {
      kind: "get",
      key: "prevState",
      value: function prevState() {
        return this.getPrevState();
      }
    }, {
      kind: "method",
      key: "getPrevState",
      value: function getPrevState() {
        return this.store._medux_.beforeState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "prevRootState",
      value: function prevRootState() {
        return this.getPrevRootState();
      }
    }, {
      kind: "method",
      key: "getPrevRootState",
      value: function getPrevRootState() {
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
        this.dispatch(this.callThisAction(this.Update, Object.assign({}, this.getState(), payload), key));
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
        const state = this.getState();
        return Object.assign({}, state, {
          loading: Object.assign({}, state.loading, payload)
        });
      }
    }]
  };
});
export const exportModule = (moduleName, initState, ActionHandles, views) => {
  const model = store => {
    const hasInjected = !!store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = initState;
      const handlers = new ActionHandles(moduleName, store);
      const actions = injectActions(store, moduleName, handlers);
      handlers.actions = actions;
      const preModuleState = store.getState()[moduleName] || {};
      const moduleState = Object.assign({}, initState, preModuleState);

      if (!moduleState.initialized) {
        moduleState.initialized = true;
        return store.dispatch(moduleInitAction(moduleName, moduleState));
      }
    }

    return undefined;
  };

  model.moduleName = moduleName;
  model.initState = initState;
  const actions = {};
  return {
    moduleName,
    model,
    views,
    actions
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