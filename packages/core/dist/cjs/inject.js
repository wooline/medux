"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.cacheModule = cacheModule;
exports.getClientStore = getClientStore;
exports.injectActions = injectActions;
exports.loadModel = _loadModel;
exports.getView = getView;
exports.getModuleByName = getModuleByName;
exports.exportModule = exports.CoreModuleHandlers = void 0;

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _basic = require("./basic");

var _actions = require("./actions");

var _env = require("./env");

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

  return _basic.MetaData.actionCreatorMap[moduleName];
}

function _loadModel(moduleName, store) {
  var hasInjected = !!store._medux_.injectedModules[moduleName];

  if (!hasInjected) {
    var moduleGetter = _basic.MetaData.moduleGetter;
    var result = moduleGetter[moduleName]();

    if ((0, _basic.isPromise)(result)) {
      return result.then(function (module) {
        cacheModule(module);
        return module.default.model(store);
      });
    }

    cacheModule(result);
    return result.default.model(store);
  }

  return undefined;
}

var CoreModuleHandlers = (0, _decorate2.default)(null, function (_initialize) {
  var CoreModuleHandlers = function CoreModuleHandlers(initState) {
    this.initState = initState;

    _initialize(this);
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
      value: function callThisAction(handler) {
        var actions = _basic.MetaData.actionCreatorMap[this.moduleName];

        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }

        return actions[handler.__actionName__].apply(actions, rest);
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
        return payload;
      }
    }, {
      kind: "method",
      decorators: [_basic.reducer],
      key: "Loading",
      value: function Loading(payload) {
        var state = this.state;
        return Object.assign({}, state, {
          loading: Object.assign({}, state.loading, payload)
        });
      }
    }]
  };
});
exports.CoreModuleHandlers = CoreModuleHandlers;

var exportModule = function exportModule(moduleName, ModuleHandles, views) {
  var model = function model(store) {
    var initState = store._medux_.injectedModules[moduleName];

    if (!initState) {
      var moduleHandles = new ModuleHandles();
      moduleHandles.moduleName = moduleName;
      moduleHandles.store = store;
      initState = moduleHandles.initState;
      store._medux_.injectedModules[moduleName] = initState;
      var actions = injectActions(store, moduleName, moduleHandles);
      moduleHandles.actions = actions;
      var preModuleState = store.getState()[moduleName] || {};
      var moduleState = Object.assign({}, initState, preModuleState);

      if (!moduleState.initialized) {
        moduleState.initialized = true;
        return store.dispatch((0, _actions.moduleInitAction)(moduleName, moduleState));
      }
    }

    return initState;
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

function getView(moduleName, viewName) {
  var moduleGetter = _basic.MetaData.moduleGetter;
  var result = moduleGetter[moduleName]();

  if ((0, _basic.isPromise)(result)) {
    return result.then(function (module) {
      cacheModule(module);
      var view = module.default.views[viewName];

      if (_env.isServerEnv) {
        return view;
      }

      var initModel = module.default.model(_basic.MetaData.clientStore);

      if ((0, _basic.isPromise)(initModel)) {
        return initModel.then(function () {
          return view;
        });
      }

      return view;
    });
  }

  cacheModule(result);
  var view = result.default.views[viewName];

  if (_env.isServerEnv) {
    return view;
  }

  var initModel = result.default.model(_basic.MetaData.clientStore);

  if ((0, _basic.isPromise)(initModel)) {
    return initModel.then(function () {
      return view;
    });
  }

  return view;
}

function getModuleByName(moduleName, moduleGetter) {
  var result = moduleGetter[moduleName]();

  if ((0, _basic.isPromise)(result)) {
    return result.then(function (module) {
      cacheModule(module);
      return module;
    });
  }

  cacheModule(result);
  return result;
}