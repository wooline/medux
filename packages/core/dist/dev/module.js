import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.map";
import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _applyDecoratedDescriptor from "@babel/runtime/helpers/esm/applyDecoratedDescriptor";

var _class, _temp;

import { reducer, getModuleActionCreatorList, isPromise, injectActions, MetaData } from './basic';
import { buildStore } from './store';
import { errorAction } from './actions';
export function exportModule(namespace) {
  var actions = getModuleActionCreatorList(namespace);
  return {
    namespace: namespace,
    actions: actions
  };
}
export var BaseModuleHandlers = (_class = (_temp =
/*#__PURE__*/
function () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function BaseModuleHandlers(initState, presetData) {
    this.initState = void 0;
    this.namespace = '';
    this.store = null;
    this.actions = null;
    initState.isModule = true;
    this.initState = initState;
  }

  var _proto = BaseModuleHandlers.prototype;

  _proto.dispatch = function dispatch(action) {
    return this.store.dispatch(action);
  };

  _proto.callThisAction = function callThisAction(handler) {
    var actions = getModuleActionCreatorList(this.namespace);
    return actions[handler.__actionName__](arguments.length <= 1 ? undefined : arguments[1]);
  };

  _proto.INIT = function INIT(payload) {
    return payload;
  };

  _proto.UPDATE = function UPDATE(payload) {
    return payload;
  };

  _proto.LOADING = function LOADING(payload) {
    var state = this.state;

    if (!state) {
      return state;
    }

    return _objectSpread({}, state, {
      loading: _objectSpread({}, state.loading, payload)
    });
  };

  _proto.updateState = function updateState(payload) {
    this.dispatch(this.callThisAction(this.UPDATE, _objectSpread({}, this.state, payload)));
  };

  _createClass(BaseModuleHandlers, [{
    key: "state",
    get: function get() {
      return this.store._medux_.prevState[this.namespace];
    }
  }, {
    key: "rootState",
    get: function get() {
      return this.store._medux_.prevState;
    }
  }, {
    key: "currentState",
    get: function get() {
      return this.store._medux_.currentState[this.namespace];
    }
  }, {
    key: "currentRootState",
    get: function get() {
      return this.store._medux_.currentState;
    }
  }]);

  return BaseModuleHandlers;
}(), _temp), (_applyDecoratedDescriptor(_class.prototype, "INIT", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "INIT"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "UPDATE", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "UPDATE"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "LOADING", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "LOADING"), _class.prototype)), _class);
export function exportModel(namespace, HandlersClass, initState) {
  var fun = function fun(store) {
    var hasInjected = store._medux_.injectedModules[namespace];

    if (!hasInjected) {
      store._medux_.injectedModules[namespace] = true;
      var moduleState = store.getState()[namespace];
      var handlers = new HandlersClass(initState, moduleState);
      handlers.namespace = namespace;
      handlers.store = store;
      var actions = injectActions(store, namespace, handlers);
      handlers.actions = actions;

      if (!moduleState) {
        var initAction = actions.INIT(handlers.initState);
        var action = store.dispatch(initAction);

        if (isPromise(action)) {
          return action;
        } else {
          return Promise.resolve(void 0);
        }
      } else {
        return Promise.resolve(void 0);
      }
    } else {
      return Promise.resolve(void 0);
    }
  };

  fun.namespace = namespace;
  fun.initState = initState;
  return fun;
}

function isPromiseModule(module) {
  return typeof module['then'] === 'function';
}

export function loadModel(getModule) {
  var result = getModule();

  if (isPromiseModule(result)) {
    return result.then(function (module) {
      return module.model;
    });
  } else {
    return Promise.resolve(result.model);
  }
}
export function getView(getModule, viewName) {
  var result = getModule();

  if (isPromiseModule(result)) {
    return result.then(function (module) {
      return module.views[viewName];
    });
  } else {
    return result.views[viewName];
  }
}

function getModuleByName(moduleName, moduleGetter) {
  var result = moduleGetter[moduleName]();

  if (isPromiseModule(result)) {
    return result.then(function (module) {
      moduleGetter[moduleName] = function () {
        return module;
      };

      return module;
    });
  } else {
    return result;
  }
}

function getModuleListByNames(moduleNames, moduleGetter) {
  var preModules = moduleNames.map(function (moduleName) {
    var module = getModuleByName(moduleName, moduleGetter);

    if (isPromiseModule(module)) {
      return module;
    } else {
      return Promise.resolve(module);
    }
  });
  return Promise.all(preModules);
}

export function buildApp(render, moduleGetter, appName, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  MetaData.appModuleName = appName;
  var ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  var initData = {};

  if (storeOptions.initData || window[ssrInitStoreKey]) {
    initData = _objectSpread({}, window[ssrInitStoreKey], storeOptions.initData);
  }

  var store = buildStore(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  var preModuleNames = [appName];

  if (initData) {
    preModuleNames.push.apply(preModuleNames, Object.keys(initData).filter(function (key) {
      return key !== appName && initData[key].isModule;
    }));
  }

  return getModuleListByNames(preModuleNames, moduleGetter).then(function (_ref) {
    var appModule = _ref[0];
    var initModel = appModule.model(store);
    render(store, appModule.model, appModule.views);
    return initModel;
  });
}
export function buildSSR(render, moduleGetter, appName, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  MetaData.appModuleName = appName;
  var ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  var store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  var appModule = moduleGetter[appName]();
  return appModule.model(store).catch(function (err) {
    return store.dispatch(errorAction(err));
  }).then(function () {
    render(store, appModule.model, appModule.views, ssrInitStoreKey);
  });
}
//# sourceMappingURL=module.js.map