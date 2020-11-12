import _decorate from "@babel/runtime/helpers/esm/decorate";
import { MetaData, config, reducer, isPromise } from './basic';
import { moduleInitAction } from './actions';
import { isServerEnv } from './env';
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
export function getClientStore() {
  return MetaData.clientStore;
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

function addModuleActionCreatorList(moduleName, actionName) {
  var actions = MetaData.actionCreatorMap[moduleName];

  if (!actions[actionName]) {
    actions[actionName] = function () {
      for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
        payload[_key] = arguments[_key];
      }

      return {
        type: moduleName + config.NSP + actionName,
        payload: payload
      };
    };
  }
}

export function injectActions(store, moduleName, handlers) {
  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          handler = bindThis(handler, handlers);
          actionNames.split(config.MSP).forEach(function (actionName) {
            actionName = actionName.trim().replace(new RegExp("^this[" + config.NSP + "]"), "" + moduleName + config.NSP);
            var arr = actionName.split(config.NSP);

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
      })();
    }
  }

  return MetaData.actionCreatorMap[moduleName];
}

function _loadModel(moduleName, store) {
  var hasInjected = !!store._medux_.injectedModules[moduleName];

  if (!hasInjected) {
    var moduleGetter = MetaData.moduleGetter;
    var result = moduleGetter[moduleName]();

    if (isPromise(result)) {
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

export { _loadModel as loadModel };
export var CoreModelHandlers = _decorate(null, function (_initialize) {
  var CoreModelHandlers = function CoreModelHandlers(moduleName, store) {
    this.moduleName = moduleName;
    this.store = store;

    _initialize(this);

    this.actions = null;
  };

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
      value: function callThisAction(handler) {
        var actions = MetaData.actionCreatorMap[this.moduleName];

        for (var _len2 = arguments.length, rest = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          rest[_key2 - 1] = arguments[_key2];
        }

        return actions[handler.__actionName__].apply(actions, rest);
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
        var state = this.getState();
        return Object.assign({}, state, {
          loading: Object.assign({}, state.loading, payload)
        });
      }
    }]
  };
});
export var exportModule = function exportModule(moduleName, initState, ActionHandles, views) {
  var model = function model(store) {
    var hasInjected = !!store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = initState;
      var handlers = new ActionHandles(moduleName, store);

      var _actions = injectActions(store, moduleName, handlers);

      handlers.actions = _actions;
      var preModuleState = store.getState()[moduleName] || {};
      var moduleState = Object.assign({}, initState, preModuleState);

      if (!moduleState.initialized) {
        moduleState.initialized = true;
        return store.dispatch(moduleInitAction(moduleName, moduleState));
      }
    }

    return undefined;
  };

  model.moduleName = moduleName;
  model.initState = initState;
  var actions = {};
  return {
    moduleName: moduleName,
    model: model,
    views: views,
    actions: actions
  };
};
export function getView(moduleName, viewName) {
  var moduleGetter = MetaData.moduleGetter;
  var result = moduleGetter[moduleName]();

  if (isPromise(result)) {
    return result.then(function (module) {
      cacheModule(module);
      var view = module.default.views[viewName];

      if (isServerEnv) {
        return view;
      }

      var initModel = module.default.model(MetaData.clientStore);

      if (isPromise(initModel)) {
        return initModel.then(function () {
          return view;
        });
      }

      return view;
    });
  }

  cacheModule(result);
  var view = result.default.views[viewName];

  if (isServerEnv) {
    return view;
  }

  var initModel = result.default.model(MetaData.clientStore);

  if (isPromise(initModel)) {
    return initModel.then(function () {
      return view;
    });
  }

  return view;
}
export function getModuleByName(moduleName, moduleGetter) {
  var result = moduleGetter[moduleName]();

  if (isPromise(result)) {
    return result.then(function (module) {
      cacheModule(module);
      return module;
    });
  }

  cacheModule(result);
  return result;
}