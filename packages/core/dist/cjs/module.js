"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.modelHotReplacement = modelHotReplacement;
exports.viewHotReplacement = viewHotReplacement;
exports.exportActions = exportActions;
exports.renderApp = renderApp;
exports.renderSSR = renderSSR;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _basic = require("./basic");

var _inject = require("./inject");

var _store = require("./store");

var _env = require("./env");

function clearHandlers(key, actionHandlerMap) {
  for (var actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      var maps = actionHandlerMap[actionName];
      delete maps[key];
    }
  }
}

function modelHotReplacement(moduleName, ActionHandles) {
  var store = _basic.MetaData.clientStore;
  var prevInitState = store._medux_.injectedModules[moduleName];

  if (prevInitState) {
    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    var handlers = new ActionHandles();
    handlers.moduleName = moduleName;
    handlers.store = store;
    var actions = (0, _inject.injectActions)(store, moduleName, handlers);
    handlers.actions = actions;

    if (JSON.stringify(prevInitState) !== JSON.stringify(handlers.initState)) {
      _env.env.console.warn("[HMR] @medux Updated model initState: " + moduleName);
    }

    _env.env.console.log("[HMR] @medux Updated model actionHandles: " + moduleName);
  }
}

var reRender = function reRender() {
  return undefined;
};

var reRenderTimer = 0;
var appView = null;

function viewHotReplacement(moduleName, views) {
  var module = _basic.MetaData.moduleGetter[moduleName]();

  if (module) {
    module.default.views = views;

    _env.env.console.warn("[HMR] @medux Updated views: " + moduleName);

    appView = _basic.MetaData.moduleGetter[_basic.MetaData.appModuleName]().default.views[_basic.MetaData.appViewName];

    if (!reRenderTimer) {
      reRenderTimer = _env.env.setTimeout(function () {
        reRenderTimer = 0;
        reRender(appView);

        _env.env.console.warn("[HMR] @medux view re rendering");
      }, 0);
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}

function exportActions(moduleGetter) {
  if (!_basic.MetaData.actionCreatorMap) {
    _basic.MetaData.moduleGetter = moduleGetter;
    _basic.MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce(function (maps, moduleName) {
      maps[moduleName] = typeof Proxy === 'undefined' ? {} : new Proxy({}, {
        get: function get(target, key) {
          return function () {
            for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
              payload[_key] = arguments[_key];
            }

            return {
              type: moduleName + _basic.config.NSP + key,
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
  }

  return _basic.MetaData.actionCreatorMap;
}

function renderApp(_x, _x2, _x3, _x4, _x5, _x6) {
  return _renderApp.apply(this, arguments);
}

function _renderApp() {
  _renderApp = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(render, moduleGetter, appModuleOrName, appViewName, storeOptions, beforeRender) {
    var appModuleName, ssrInitStoreKey, initData, moduleStore, store, storeState, preModuleNames, appModule, i, k, _moduleName, module;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (storeOptions === void 0) {
              storeOptions = {};
            }

            if (reRenderTimer) {
              _env.env.clearTimeout.call(null, reRenderTimer);

              reRenderTimer = 0;
            }

            appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
            _basic.MetaData.appModuleName = appModuleName;
            _basic.MetaData.appViewName = appViewName;

            if (typeof appModuleOrName !== 'string') {
              (0, _inject.cacheModule)(appModuleOrName);
            }

            ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
            initData = storeOptions.initData || {};

            if (_env.client[ssrInitStoreKey]) {
              initData = Object.assign({}, initData, _env.client[ssrInitStoreKey]);
            }

            moduleStore = (0, _store.buildStore)(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            store = beforeRender ? beforeRender(moduleStore) : moduleStore;
            storeState = store.getState();
            preModuleNames = Object.keys(storeState).filter(function (key) {
              return key !== appModuleName && moduleGetter[key];
            });
            preModuleNames.unshift(appModuleName);
            i = 0, k = preModuleNames.length;

          case 15:
            if (!(i < k)) {
              _context.next = 26;
              break;
            }

            _moduleName = preModuleNames[i];
            _context.next = 19;
            return (0, _inject.getModuleByName)(_moduleName, moduleGetter);

          case 19:
            module = _context.sent;
            _context.next = 22;
            return module.default.model(store);

          case 22:
            if (i === 0) {
              appModule = module;
            }

          case 23:
            i++;
            _context.next = 15;
            break;

          case 26:
            reRender = render(store, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey);
            return _context.abrupt("return", {
              store: store
            });

          case 28:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _renderApp.apply(this, arguments);
}

function renderSSR(_x7, _x8, _x9, _x10, _x11, _x12) {
  return _renderSSR.apply(this, arguments);
}

function _renderSSR() {
  _renderSSR = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(render, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender) {
    var ssrInitStoreKey, moduleStore, store, storeState, preModuleNames, appModule, i, k, _moduleName2, module;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (storeOptions === void 0) {
              storeOptions = {};
            }

            _basic.MetaData.appModuleName = appModuleName;
            _basic.MetaData.appViewName = appViewName;
            ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
            moduleStore = (0, _store.buildStore)(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            store = beforeRender ? beforeRender(moduleStore) : moduleStore;
            storeState = store.getState();
            preModuleNames = Object.keys(storeState).filter(function (key) {
              return key !== appModuleName && moduleGetter[key];
            });
            preModuleNames.unshift(appModuleName);
            i = 0, k = preModuleNames.length;

          case 10:
            if (!(i < k)) {
              _context2.next = 19;
              break;
            }

            _moduleName2 = preModuleNames[i];
            module = moduleGetter[_moduleName2]();
            _context2.next = 15;
            return module.default.model(store);

          case 15:
            if (i === 0) {
              appModule = module;
            }

          case 16:
            i++;
            _context2.next = 10;
            break;

          case 19:
            return _context2.abrupt("return", render(store, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey));

          case 20:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _renderSSR.apply(this, arguments);
}