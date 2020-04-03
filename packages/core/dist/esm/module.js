import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { MetaData, cacheModule, client, config, injectActions, isPromise, reducer } from './basic';
import { buildStore, loadModel as _loadModel } from './store';

function clearHandlers(key, actionHandlerMap) {
  for (var actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      var maps = actionHandlerMap[actionName];
      delete maps[key];
    }
  }
}

export function modelHotReplacement(moduleName, initState, ActionHandles) {
  var store = MetaData.clientStore;
  var prevInitState = store._medux_.injectedModules[moduleName];
  initState.isModule = true;

  if (prevInitState) {
    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    var handlers = new ActionHandles(moduleName, store);
    var actions = injectActions(store, moduleName, handlers);
    handlers.actions = actions;
  }
}

var reRender = function reRender() {
  return void 0;
};

var reRenderTimer = 0;
var appView = null;
export function viewHotReplacement(moduleName, views) {
  var moduleGetter = MetaData.moduleGetter[moduleName];
  var module = moduleGetter['__module__'];

  if (module) {
    module.default.views = views;

    if (!reRenderTimer) {
      reRenderTimer = setTimeout(function () {
        reRenderTimer = 0;
        reRender(appView);
      }, 0);
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}
export var exportModule = function exportModule(moduleName, initState, ActionHandles, views) {
  var model = function model(store, options) {
    var hasInjected = !!store._medux_.injectedModules[moduleName];

    if (!hasInjected) {
      store._medux_.injectedModules[moduleName] = initState;
      var moduleState = store.getState()[moduleName];
      var handlers = new ActionHandles(moduleName, store);

      var _actions = injectActions(store, moduleName, handlers);

      handlers.actions = _actions;

      if (!moduleState) {
        var params = store._medux_.prevState.route.data.params;
        initState.isModule = true;

        var initAction = _actions.Init(initState, params[moduleName], options);

        return store.dispatch(initAction);
      }
    }

    return void 0;
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
export var BaseModelHandlers = _decorate(null, function (_initialize) {
  var BaseModelHandlers = function BaseModelHandlers(moduleName, store) {
    this.moduleName = moduleName;
    this.store = store;

    _initialize(this);
  };

  return {
    F: BaseModelHandlers,
    d: [{
      kind: "field",
      key: "actions",
      value: function value() {
        return null;
      }
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
      key: "beforeState",
      value: function beforeState() {
        return this.getBeforeState();
      }
    }, {
      kind: "method",
      key: "getBeforeState",
      value: function getBeforeState() {
        return this.store._medux_.beforeState[this.moduleName];
      }
    }, {
      kind: "get",
      key: "beforeRootState",
      value: function beforeRootState() {
        return this.getBeforeRootState();
      }
    }, {
      kind: "method",
      key: "getBeforeRootState",
      value: function getBeforeRootState() {
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

        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }

        return actions[handler.__actionName__].apply(actions, rest);
      }
    }, {
      kind: "method",
      key: "updateState",
      value: function updateState(payload) {
        this.dispatch(this.callThisAction(this.Update, Object.assign({}, this.getState(), {}, payload)));
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel(moduleName, options) {
        return _loadModel(moduleName, this.store, options);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState, routeParams, options) {
        return Object.assign({}, initState, {
          routeParams: routeParams || initState.routeParams
        }, options);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Update",
      value: function Update(payload) {
        return payload;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        var state = this.getState();
        return Object.assign({}, state, {
          routeParams: payload
        });
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Loading",
      value: function Loading(payload) {
        var state = this.getState();
        return Object.assign({}, state, {
          loading: Object.assign({}, state.loading, {}, payload)
        });
      }
    }]
  };
});
export function isPromiseModule(module) {
  return typeof module['then'] === 'function';
}
export function isPromiseView(moduleView) {
  return typeof moduleView['then'] === 'function';
}
export function exportActions(moduleGetter) {
  MetaData.moduleGetter = moduleGetter;
  MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce(function (maps, moduleName) {
    maps[moduleName] = typeof Proxy === 'undefined' ? {} : new Proxy({}, {
      get: function get(target, key) {
        return function () {
          for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            payload[_key2] = arguments[_key2];
          }

          return {
            type: moduleName + config.NSP + key,
            payload: payload
          };
        };
      },
      set: function set() {
        return true;
      }
    });
    return maps;
  }, {});
  return MetaData.actionCreatorMap;
}
export function getView(moduleName, viewName, modelOptions) {
  var moduleGetter = MetaData.moduleGetter;
  var result = moduleGetter[moduleName]();

  if (isPromiseModule(result)) {
    return result.then(function (module) {
      moduleGetter[moduleName] = cacheModule(module);
      var view = module.default.views[viewName];

      if (MetaData.isServer) {
        return view;
      }

      var initModel = module.default.model(MetaData.clientStore, modelOptions);

      if (isPromise(initModel)) {
        return initModel.then(function () {
          return view;
        });
      } else {
        return view;
      }
    });
  } else {
    var view = result.default.views[viewName];

    if (MetaData.isServer) {
      return view;
    }

    var initModel = result.default.model(MetaData.clientStore, modelOptions);

    if (isPromise(initModel)) {
      return initModel.then(function () {
        return view;
      });
    } else {
      return view;
    }
  }
}

function getModuleByName(moduleName, moduleGetter) {
  var result = moduleGetter[moduleName]();

  if (isPromiseModule(result)) {
    return result.then(function (module) {
      moduleGetter[moduleName] = cacheModule(module);
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

export function renderApp(render, moduleGetter, appModuleName, history, storeOptions, beforeRender) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (reRenderTimer) {
    clearTimeout(reRenderTimer);
    reRenderTimer = 0;
  }

  MetaData.appModuleName = appModuleName;
  var ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
  var initData = {};

  if (storeOptions.initData || client[ssrInitStoreKey]) {
    initData = Object.assign({}, client[ssrInitStoreKey], {}, storeOptions.initData);
  }

  var store = buildStore(history, initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
  var reduxStore = beforeRender ? beforeRender(store) : store;
  var preModuleNames = [appModuleName];

  if (initData) {
    preModuleNames.push.apply(preModuleNames, Object.keys(initData).filter(function (key) {
      return key !== appModuleName && initData[key].isModule;
    }));
  }

  return getModuleListByNames(preModuleNames, moduleGetter).then(function (_ref) {
    var appModule = _ref[0];
    var initModel = appModule.default.model(reduxStore, undefined);
    appView = appModule.default.views.Main;
    reRender = render(reduxStore, appModule.default.model, appView, ssrInitStoreKey);
    return initModel;
  });
}
export function renderSSR(_x, _x2, _x3, _x4, _x5, _x6) {
  return _renderSSR.apply(this, arguments);
}

function _renderSSR() {
  _renderSSR = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(render, moduleGetter, appModuleName, history, storeOptions, beforeRender) {
    var ssrInitStoreKey, store, reduxStore, storeState, paths, appModule, inited, i, k, _paths$i$split, _moduleName, module;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (storeOptions === void 0) {
              storeOptions = {};
            }

            MetaData.appModuleName = appModuleName;
            ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
            store = buildStore(history, storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            reduxStore = beforeRender ? beforeRender(store) : store;
            storeState = reduxStore.getState();
            paths = storeState.route.data.paths;
            paths.length === 0 && paths.push(appModuleName);
            appModule = undefined;
            inited = {};
            i = 0, k = paths.length;

          case 11:
            if (!(i < k)) {
              _context.next = 22;
              break;
            }

            _paths$i$split = paths[i].split(config.VSP), _moduleName = _paths$i$split[0];

            if (inited[_moduleName]) {
              _context.next = 19;
              break;
            }

            inited[_moduleName] = true;
            module = moduleGetter[_moduleName]();
            _context.next = 18;
            return module.default.model(reduxStore, undefined);

          case 18:
            if (i === 0) {
              appModule = module;
            }

          case 19:
            i++;
            _context.next = 11;
            break;

          case 22:
            return _context.abrupt("return", render(reduxStore, appModule.default.model, appModule.default.views.Main, ssrInitStoreKey));

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _renderSSR.apply(this, arguments);
}