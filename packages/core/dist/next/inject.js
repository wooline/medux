import _decorate from "@babel/runtime/helpers/esm/decorate";
import { env } from './env';
import { isPromise } from './sprite';
import { injectActions, MetaData, config, reducer, mergeState } from './basic';
import { moduleInitAction, moduleReInitAction } from './actions';
export const exportModule = (moduleName, ModuleHandles, views) => {
  const model = controller => {
    if (!controller.injectedModules[moduleName]) {
      const moduleHandles = new ModuleHandles();
      controller.injectedModules[moduleName] = moduleHandles;
      moduleHandles.moduleName = moduleName;
      moduleHandles.controller = controller;
      moduleHandles.actions = MetaData.facadeMap[moduleName].actions;
      injectActions(moduleName, moduleHandles);
      const initState = moduleHandles.initState;
      const preModuleState = controller.getState()[moduleName] || {};
      const moduleState = { ...initState,
        ...preModuleState
      };

      if (moduleState.initialized) {
        return controller.dispatch(moduleReInitAction(moduleName, moduleState));
      }

      moduleState.initialized = true;
      return controller.dispatch(moduleInitAction(moduleName, moduleState));
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

    module.default.model(MetaData.clientController);
    return view;
  };

  const moduleOrPromise = getModuleByName(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(callback);
  }

  return callback(moduleOrPromise);
}

function _loadModel(moduleName, controller) {
  const moduleOrPromise = getModuleByName(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(module => module.default.model(controller));
  }

  return moduleOrPromise.default.model(controller);
}

export { _loadModel as loadModel };
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
      key: "controller",
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
        return this.controller.getState()[this.moduleName];
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.controller.getState();
      }
    }, {
      kind: "method",
      key: "getActionName",
      value: function getActionName() {
        return this.controller.prevData.actionName;
      }
    }, {
      kind: "get",
      key: "prevRootState",
      value: function prevRootState() {
        return this.controller.prevData.prevState;
      }
    }, {
      kind: "get",
      key: "prevState",
      value: function prevState() {
        return this.controller.prevData.prevState[this.moduleName];
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.controller.dispatch(action);
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel(moduleName) {
        return _loadModel(moduleName, this.controller);
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

function clearHandlers(moduleName, actionHandlerMap) {
  for (const actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      const maps = actionHandlerMap[actionName];
      delete maps[moduleName];
    }
  }
}

export function modelHotReplacement(moduleName, ModuleHandles) {
  const controller = MetaData.clientController;

  if (controller.injectedModules[moduleName]) {
    clearHandlers(moduleName, MetaData.reducersMap);
    clearHandlers(moduleName, MetaData.effectsMap);
    const moduleHandles = new ModuleHandles();
    controller.injectedModules[moduleName] = moduleHandles;
    moduleHandles.moduleName = moduleName;
    moduleHandles.controller = controller;
    moduleHandles.actions = MetaData.facadeMap[moduleName].actions;
    injectActions(moduleName, moduleHandles);
    env.console.log(`[HMR] @medux Updated model: ${moduleName}`);
  }
}
export function getRootModuleAPI(data) {
  if (!MetaData.facadeMap) {
    if (data) {
      MetaData.facadeMap = Object.keys(data).reduce((prev, moduleName) => {
        const arr = data[moduleName];
        const actions = {};
        const actionNames = {};
        arr.forEach(actionName => {
          actions[actionName] = (...payload) => ({
            type: moduleName + config.NSP + actionName,
            payload
          });

          actionNames[actionName] = moduleName + config.NSP + actionName;
        });
        const moduleFacade = {
          name: moduleName,
          actions,
          actionNames
        };
        prev[moduleName] = moduleFacade;
        return prev;
      }, {});
    } else {
      const cacheData = {};
      MetaData.facadeMap = new Proxy({}, {
        set(target, moduleName, val, receiver) {
          return Reflect.set(target, moduleName, val, receiver);
        },

        get(target, moduleName, receiver) {
          const val = Reflect.get(target, moduleName, receiver);

          if (val !== undefined) {
            return val;
          }

          if (!cacheData[moduleName]) {
            cacheData[moduleName] = {
              name: moduleName,
              actionNames: new Proxy({}, {
                get(__, actionName) {
                  return moduleName + config.NSP + actionName;
                }

              }),
              actions: new Proxy({}, {
                get(__, actionName) {
                  return (...payload) => ({
                    type: moduleName + config.NSP + actionName,
                    payload
                  });
                }

              })
            };
          }

          return cacheData[moduleName];
        }

      });
    }
  }

  return MetaData.facadeMap;
}