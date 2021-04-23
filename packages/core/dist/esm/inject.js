import _decorate from "@babel/runtime/helpers/esm/decorate";
import _extends from "@babel/runtime/helpers/esm/extends";
import { env } from './env';
import { isPromise } from './sprite';
import { injectActions, MetaData, config, reducer, mergeState } from './basic';
import { moduleInitAction, moduleReInitAction } from './actions';
export var exportModule = function exportModule(moduleName, ModuleHandles, views) {
  var model = function model(controller) {
    if (!controller.injectedModules[moduleName]) {
      var moduleHandles = new ModuleHandles();
      controller.injectedModules[moduleName] = moduleHandles;
      moduleHandles.moduleName = moduleName;
      moduleHandles.controller = controller;
      moduleHandles.actions = MetaData.facadeMap[moduleName].actions;
      injectActions(moduleName, moduleHandles);
      var _initState = moduleHandles.initState;
      var preModuleState = controller.state[moduleName] || {};

      var moduleState = _extends({}, _initState, preModuleState);

      if (moduleState.initialized) {
        return controller.dispatch(moduleReInitAction(moduleName, moduleState));
      }

      moduleState.initialized = true;
      return controller.dispatch(moduleInitAction(moduleName, moduleState));
    }

    return undefined;
  };

  return {
    moduleName: moduleName,
    model: model,
    views: views,
    initState: undefined,
    actions: undefined
  };
};
export function cacheModule(module) {
  var moduleName = module.default.moduleName;
  var moduleGetter = MetaData.moduleGetter;
  var fn = moduleGetter[moduleName];

  if (fn.__module__ === module) {
    return fn;
  }

  fn = function fn() {
    return module;
  };

  fn.__module__ = module;
  moduleGetter[moduleName] = fn;
  return fn;
}
export function getModuleByName(moduleName) {
  var result = MetaData.moduleGetter[moduleName]();

  if (isPromise(result)) {
    return result.then(function (module) {
      cacheModule(module);
      return module;
    });
  }

  cacheModule(result);
  return result;
}
export function getView(moduleName, viewName) {
  var callback = function callback(module) {
    var view = module.default.views[viewName];

    if (env.isServer) {
      return view;
    }

    module.default.model(MetaData.clientController);
    return view;
  };

  var moduleOrPromise = getModuleByName(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(callback);
  }

  return callback(moduleOrPromise);
}

function _loadModel(moduleName, controller) {
  var moduleOrPromise = getModuleByName(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      return module.default.model(controller);
    });
  }

  return moduleOrPromise.default.model(controller);
}

export { _loadModel as loadModel };
export var CoreModuleHandlers = _decorate(null, function (_initialize) {
  var CoreModuleHandlers = function CoreModuleHandlers(initState) {
    _initialize(this);

    this.initState = initState;
  };

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
      value: function value() {
        return '';
      }
    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.controller.state[this.moduleName];
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.controller.state;
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
        var loading = mergeState(this.state.loading, payload);
        return mergeState(this.state, {
          loading: loading
        });
      }
    }]
  };
});

function clearHandlers(moduleName, actionHandlerMap) {
  for (var _actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(_actionName)) {
      var maps = actionHandlerMap[_actionName];
      delete maps[moduleName];
    }
  }
}

export function modelHotReplacement(moduleName, ModuleHandles) {
  var controller = MetaData.clientController;

  if (controller.injectedModules[moduleName]) {
    clearHandlers(moduleName, MetaData.reducersMap);
    clearHandlers(moduleName, MetaData.effectsMap);
    var moduleHandles = new ModuleHandles();
    controller.injectedModules[moduleName] = moduleHandles;
    moduleHandles.moduleName = moduleName;
    moduleHandles.controller = controller;
    moduleHandles.actions = MetaData.facadeMap[moduleName].actions;
    injectActions(moduleName, moduleHandles);
    env.console.log("[HMR] @medux Updated model: " + moduleName);
  }
}
export function getRootModuleAPI(data) {
  if (!MetaData.facadeMap) {
    if (data) {
      MetaData.facadeMap = Object.keys(data).reduce(function (prev, moduleName) {
        var arr = data[moduleName];
        var actions = {};
        var actionNames = {};
        arr.forEach(function (actionName) {
          actions[actionName] = function () {
            for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
              payload[_key] = arguments[_key];
            }

            return {
              type: moduleName + config.NSP + actionName,
              payload: payload
            };
          };

          actionNames[actionName] = moduleName + config.NSP + actionName;
        });
        var moduleFacade = {
          name: moduleName,
          actions: actions,
          actionNames: actionNames
        };
        prev[moduleName] = moduleFacade;
        return prev;
      }, {});
    } else {
      var cacheData = {};
      MetaData.facadeMap = new Proxy({}, {
        set: function set(target, moduleName, val, receiver) {
          return Reflect.set(target, moduleName, val, receiver);
        },
        get: function get(target, moduleName, receiver) {
          var val = Reflect.get(target, moduleName, receiver);

          if (val !== undefined) {
            return val;
          }

          if (!cacheData[moduleName]) {
            cacheData[moduleName] = {
              name: moduleName,
              actionNames: new Proxy({}, {
                get: function get(__, actionName) {
                  return moduleName + config.NSP + actionName;
                }
              }),
              actions: new Proxy({}, {
                get: function get(__, actionName) {
                  return function () {
                    for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      payload[_key2] = arguments[_key2];
                    }

                    return {
                      type: moduleName + config.NSP + actionName,
                      payload: payload
                    };
                  };
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