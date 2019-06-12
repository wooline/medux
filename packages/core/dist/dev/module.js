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

import { MetaData, getModuleActionCreatorList, injectActions, isPromise, reducer } from './basic';
import { buildStore } from './store';
import { errorAction } from './actions';
export function exportFacade(moduleName) {
  var actions = getModuleActionCreatorList(moduleName);
  return {
    moduleName: moduleName,
    actions: actions
  };
}
export var exportModule = function exportModule(moduleName, initState, ActionHandles, views) {
  var model = function model(store) {
    var hasInjected = store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = true;
      var moduleState = store.getState()[moduleName];
      var handlers = new ActionHandles(initState, moduleState);
      handlers.moduleName = moduleName;
      handlers.store = store;
      var actions = injectActions(store, moduleName, handlers);
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

  model.moduleName = moduleName;
  model.initState = initState;
  return {
    moduleName: moduleName,
    model: model,
    views: views
  };
};
export var BaseModelHandlers = (_class = (_temp =
/*#__PURE__*/
function () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function BaseModelHandlers(initState, presetData) {
    this.initState = void 0;
    this.moduleName = '';
    this.store = null;
    this.actions = null;
    initState.isModule = true;
    this.initState = initState;
  }

  var _proto = BaseModelHandlers.prototype;

  _proto.dispatch = function dispatch(action) {
    return this.store.dispatch(action);
  };

  _proto.callThisAction = function callThisAction(handler) {
    var actions = getModuleActionCreatorList(this.moduleName);
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

  _createClass(BaseModelHandlers, [{
    key: "state",
    get: function get() {
      return this.store._medux_.prevState[this.moduleName];
    }
  }, {
    key: "rootState",
    get: function get() {
      return this.store._medux_.prevState;
    }
  }, {
    key: "currentState",
    get: function get() {
      return this.store._medux_.currentState[this.moduleName];
    }
  }, {
    key: "currentRootState",
    get: function get() {
      return this.store._medux_.currentState;
    }
  }]);

  return BaseModelHandlers;
}(), _temp), (_applyDecoratedDescriptor(_class.prototype, "INIT", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "INIT"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "UPDATE", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "UPDATE"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "LOADING", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "LOADING"), _class.prototype)), _class);
export function isPromiseModule(module) {
  return typeof module['then'] === 'function';
}
export function isPromiseView(moduleView) {
  return typeof moduleView['then'] === 'function';
}
export function loadModel(moduleGetter, moduleName) {
  moduleGetter = MetaData.moduleGetter;
  var result = moduleGetter[moduleName]();

  if (isPromiseModule(result)) {
    return result.then(function (module) {
      moduleGetter[moduleName] = function () {
        return module;
      };

      return module.default.model;
    });
  } else {
    return Promise.resolve(result.default.model);
  }
}
export function getView(moduleGetter, moduleName, viewName) {
  moduleGetter = MetaData.moduleGetter;
  var result = moduleGetter[moduleName]();

  if (isPromiseModule(result)) {
    return result.then(function (module) {
      moduleGetter[moduleName] = function () {
        return module;
      };

      return module.default.views[viewName];
    });
  } else {
    return result.default.views[viewName];
  }
}

function getModuleByName(moduleName, moduleGetter) {
  var result = moduleGetter[moduleName]();

  if (isPromiseModule(result)) {
    return result.then(function (module) {
      //在SSR时loadView不能出现异步，否则浏览器初轮渲染不会包括异步组件，从而导致和服务器返回不一致
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

export function renderApp(render, moduleGetter, appModuleName, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  MetaData.appModuleName = appModuleName;
  MetaData.moduleGetter = moduleGetter;
  var ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  var initData = {};

  if (storeOptions.initData || window[ssrInitStoreKey]) {
    initData = _objectSpread({}, window[ssrInitStoreKey], storeOptions.initData);
  }

  var store = buildStore(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  var preModuleNames = [appModuleName];

  if (initData) {
    preModuleNames.push.apply(preModuleNames, Object.keys(initData).filter(function (key) {
      return key !== appModuleName && initData[key].isModule;
    }));
  }

  return getModuleListByNames(preModuleNames, moduleGetter).then(function (_ref) {
    var appModule = _ref[0];
    var initModel = appModule.default.model(store);
    render(store, appModule.default.model, appModule.default.views, ssrInitStoreKey);
    return initModel;
  });
}
export function renderSSR(render, moduleGetter, appModuleName, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  MetaData.appModuleName = appModuleName;
  MetaData.moduleGetter = moduleGetter;
  var ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  var store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  var appModule = moduleGetter[appModuleName]();
  return appModule.default.model(store).catch(function (err) {
    return store.dispatch(errorAction(err));
  }).then(function () {
    return render(store, appModule.default.model, appModule.default.views, ssrInitStoreKey);
  });
}
//# sourceMappingURL=module.js.map