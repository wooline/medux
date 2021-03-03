"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.cacheModule = cacheModule;
exports.getClientStore = getClientStore;
exports.injectActions = injectActions;
exports.getModuleByName = getModuleByName;
exports.getView = getView;
exports.loadModel = _loadModel;
exports.exportModule = exports.CoreModuleHandlers = void 0;

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _env = require("./env");

var _basic = require("./basic");

var _actions = require("./actions");

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

function getClientStore() {
  return _basic.MetaData.clientStore;
}

function bindThis(fun, thisObj) {
  var newFun = fun.bind(thisObj);
  Object.keys(fun).forEach(function (key) {
    newFun[key] = fun[key];
  });
  return newFun;
}

function transformAction(actionName, action, listenerModule, actionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (actionHandlerMap[actionName][listenerModule]) {
    throw new Error("Action duplicate or conflict : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = action;
}

function injectActions(store, moduleName, handlers) {
  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          handler = bindThis(handler, handlers);
          actionNames.split(_basic.config.MSP).forEach(function (actionName) {
            actionName = actionName.trim().replace(new RegExp("^this[" + _basic.config.NSP + "]"), "" + moduleName + _basic.config.NSP);
            var arr = actionName.split(_basic.config.NSP);

            if (arr[1]) {
              handler.__isHandler__ = true;
              transformAction(actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
            } else {
              handler.__isHandler__ = false;
              transformAction(moduleName + _basic.config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? store._medux_.effectMap : store._medux_.reducerMap);
            }
          });
        }
      })();
    }
  }
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
      value: function value() {
        return null;
      }
    }, {
      kind: "field",
      key: "store",
      value: function value() {
        return null;
      }
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
        return _basic.MetaData.currentData.actionName;
      }
    }, {
      kind: "get",
      key: "prevRootState",
      value: function prevRootState() {
        return _basic.MetaData.currentData.prevState;
      }
    }, {
      kind: "get",
      key: "prevState",
      value: function prevState() {
        return _basic.MetaData.currentData.prevState[this.moduleName];
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

var exportModule = function exportModule(moduleName, ModuleHandles, views) {
  var model = function model(store) {
    var hasInjected = store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = true;
      var moduleHandles = new ModuleHandles();
      moduleHandles.moduleName = moduleName;
      moduleHandles.store = store;
      moduleHandles.actions = _basic.MetaData.facadeMap[moduleName].actions;
      var _initState = moduleHandles.initState;
      injectActions(store, moduleName, moduleHandles);
      var preModuleState = store.getState()[moduleName] || {};
      var moduleState = Object.assign({}, _initState, preModuleState);

      if (moduleState.initialized) {
        return store.dispatch((0, _actions.moduleReInitAction)(moduleName, moduleState));
      }

      moduleState.initialized = true;
      return store.dispatch((0, _actions.moduleInitAction)(moduleName, moduleState));
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

function getModuleByName(moduleName) {
  var result = _basic.MetaData.moduleGetter[moduleName]();

  if ((0, _basic.isPromise)(result)) {
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

  if ((0, _basic.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(callback);
  }

  return callback(moduleOrPromise);
}

function _loadModel(moduleName, store) {
  var moduleOrPromise = getModuleByName(moduleName);

  if ((0, _basic.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      return module.default.model(store);
    });
  }

  return moduleOrPromise.default.model(store);
}