"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.cacheModule = cacheModule;
exports.getModuleByName = getModuleByName;
exports.getView = getView;
exports.loadModel = _loadModel;
exports.modelHotReplacement = modelHotReplacement;
exports.getRootModuleAPI = getRootModuleAPI;
exports.CoreModuleHandlers = exports.exportModule = void 0;

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _env = require("./env");

var _sprite = require("./sprite");

var _basic = require("./basic");

var _actions = require("./actions");

var exportModule = function exportModule(moduleName, ModuleHandles, views) {
  var model = function model(store) {
    if (!store.injectedModules[moduleName]) {
      var moduleHandles = new ModuleHandles();
      store.injectedModules[moduleName] = moduleHandles;
      moduleHandles.moduleName = moduleName;
      moduleHandles.store = store;
      moduleHandles.actions = _basic.MetaData.facadeMap[moduleName].actions;
      (0, _basic.injectActions)(moduleName, moduleHandles);
      var _initState = moduleHandles.initState;
      var preModuleState = store.getState(moduleName);

      if (preModuleState) {
        return store.dispatch((0, _actions.moduleReInitAction)(moduleName, _initState));
      }

      return store.dispatch((0, _actions.moduleInitAction)(moduleName, _initState));
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

exports.exportModule = exportModule;

function cacheModule(module) {
  var moduleName = module.default.moduleName;
  var moduleGetter = _basic.MetaData.moduleGetter;
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

function getModuleByName(moduleName) {
  var result = _basic.MetaData.moduleGetter[moduleName]();

  if ((0, _sprite.isPromise)(result)) {
    return result.then(function (module) {
      cacheModule(module);
      return module;
    });
  }

  cacheModule(result);
  return result;
}

function getView(moduleName, viewName) {
  var callback = function callback(module) {
    var view = module.default.views[viewName];

    if (_env.env.isServer) {
      return view;
    }

    module.default.model(_basic.MetaData.clientStore);
    return view;
  };

  var moduleOrPromise = getModuleByName(moduleName);

  if ((0, _sprite.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(callback);
  }

  return callback(moduleOrPromise);
}

function _loadModel(moduleName, controller) {
  var moduleOrPromise = getModuleByName(moduleName);

  if ((0, _sprite.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      return module.default.model(controller);
    });
  }

  return moduleOrPromise.default.model(controller);
}

var CoreModuleHandlers = (0, _decorate2.default)(null, function (_initialize) {
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
      key: "store",
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
        return this.store.getState(this.moduleName);
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.store.getState();
      }
    }, {
      kind: "method",
      key: "getCurrentActionName",
      value: function getCurrentActionName() {
        return this.store.getCurrentActionName();
      }
    }, {
      kind: "get",
      key: "currentRootState",
      value: function currentRootState() {
        return this.store.getCurrentState();
      }
    }, {
      kind: "get",
      key: "currentState",
      value: function currentState() {
        return this.store.getCurrentState(this.moduleName);
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
      decorators: [_basic.reducer],
      key: "Init",
      value: function Init(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [_basic.reducer],
      key: "Update",
      value: function Update(payload, key) {
        return (0, _basic.mergeState)(this.state, payload);
      }
    }, {
      kind: "method",
      decorators: [_basic.reducer],
      key: "Loading",
      value: function Loading(payload) {
        var loading = (0, _basic.mergeState)(this.state.loading, payload);
        return (0, _basic.mergeState)(this.state, {
          loading: loading
        });
      }
    }]
  };
});
exports.CoreModuleHandlers = CoreModuleHandlers;

function clearHandlers(moduleName, actionHandlerMap) {
  for (var _actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(_actionName)) {
      var maps = actionHandlerMap[_actionName];
      delete maps[moduleName];
    }
  }
}

function modelHotReplacement(moduleName, ModuleHandles) {
  var store = _basic.MetaData.clientStore;

  if (store.injectedModules[moduleName]) {
    clearHandlers(moduleName, _basic.MetaData.reducersMap);
    clearHandlers(moduleName, _basic.MetaData.effectsMap);
    var moduleHandles = new ModuleHandles();
    store.injectedModules[moduleName] = moduleHandles;
    moduleHandles.moduleName = moduleName;
    moduleHandles.store = store;
    moduleHandles.actions = _basic.MetaData.facadeMap[moduleName].actions;
    (0, _basic.injectActions)(moduleName, moduleHandles);

    _env.env.console.log("[HMR] @medux Updated model: " + moduleName);
  }
}

function getRootModuleAPI(data) {
  if (!_basic.MetaData.facadeMap) {
    if (data) {
      _basic.MetaData.facadeMap = Object.keys(data).reduce(function (prev, moduleName) {
        var arr = data[moduleName];
        var actions = {};
        var actionNames = {};
        arr.forEach(function (actionName) {
          actions[actionName] = function () {
            for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
              payload[_key] = arguments[_key];
            }

            return {
              type: moduleName + _basic.config.NSP + actionName,
              payload: payload
            };
          };

          actionNames[actionName] = moduleName + _basic.config.NSP + actionName;
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
      _basic.MetaData.facadeMap = new Proxy({}, {
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
                  return moduleName + _basic.config.NSP + actionName;
                }
              }),
              actions: new Proxy({}, {
                get: function get(__, actionName) {
                  return function () {
                    for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      payload[_key2] = arguments[_key2];
                    }

                    return {
                      type: moduleName + _basic.config.NSP + actionName,
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

  return _basic.MetaData.facadeMap;
}