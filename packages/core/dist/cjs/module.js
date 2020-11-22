"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.modelHotReplacement = modelHotReplacement;
exports.viewHotReplacement = viewHotReplacement;
exports.exportModuleStaticInfo = exportModuleStaticInfo;
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

function exportModuleStaticInfo(actionCreatorMap, viewNamesMap) {
  if (!_basic.MetaData.actionCreatorMap) {
    if (typeof Proxy === 'undefined') {
      _basic.MetaData.actionCreatorMap = actionCreatorMap;
    } else {
      var cacheData = {};
      _basic.MetaData.actionCreatorMap = new Proxy({}, {
        get: function get(_, moduleName) {
          if (!cacheData[moduleName]) {
            cacheData[moduleName] = new Proxy({}, {
              get: function get(__, actionName) {
                var type = moduleName + _basic.config.NSP + actionName;

                var action = function action() {
                  for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
                    payload[_key] = arguments[_key];
                  }

                  return {
                    type: type,
                    payload: payload
                  };
                };

                action.toString = function () {
                  return type;
                };

                return action;
              }
            });
          }

          return cacheData[moduleName];
        }
      });
    }
  }

  if (!_basic.MetaData.viewNamesMap) {
    if (typeof Proxy === 'undefined') {
      _basic.MetaData.viewNamesMap = viewNamesMap;
    } else {
      var _cacheData = {};
      _basic.MetaData.viewNamesMap = new Proxy({}, {
        get: function get(_, moduleName) {
          if (!_cacheData[moduleName]) {
            _cacheData[moduleName] = new Proxy({}, {
              get: function get(__, viewName) {
                return "" + moduleName + _basic.config.VSP + viewName;
              }
            });
          }

          return _cacheData[moduleName];
        }
      });
    }
  }

  return {
    actions: _basic.MetaData.actionCreatorMap,
    views: _basic.MetaData.viewNamesMap
  };
}

function renderApp(_x, _x2, _x3, _x4, _x5, _x6) {
  return _renderApp.apply(this, arguments);
}

function _renderApp() {
  _renderApp = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(render, moduleGetter, appModuleOrName, appViewName, storeOptions, beforeRender) {
    var appModuleName, ssrInitStoreKey, initData, store, appModule;
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
            _basic.MetaData.moduleGetter = moduleGetter;

            if (typeof appModuleOrName !== 'string') {
              (0, _inject.cacheModule)(appModuleOrName);
            }

            ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
            initData = storeOptions.initData || {};

            if (_env.client[ssrInitStoreKey]) {
              initData = Object.assign({}, initData, _env.client[ssrInitStoreKey]);
            }

            store = (0, _store.buildStore)(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            beforeRender(store);
            _context.next = 14;
            return (0, _inject.getModuleByName)(appModuleName, moduleGetter);

          case 14:
            appModule = _context.sent;
            _context.next = 17;
            return appModule.default.model(store);

          case 17:
            reRender = render(store, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey);
            return _context.abrupt("return", {
              store: store
            });

          case 19:
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
    var ssrInitStoreKey, store, preModuleNames, appModule;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (storeOptions === void 0) {
              storeOptions = {};
            }

            _basic.MetaData.appModuleName = appModuleName;
            _basic.MetaData.appViewName = appViewName;
            _basic.MetaData.moduleGetter = moduleGetter;
            ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
            store = (0, _store.buildStore)(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            preModuleNames = beforeRender(store);
            _context2.next = 9;
            return Promise.all(preModuleNames.map(function (moduleName) {
              if (moduleGetter[moduleName]) {
                var module = moduleGetter[moduleName]();

                if (module.default.moduleName === appModuleName) {
                  appModule = module;
                }

                return module.default.model(store);
              }

              return null;
            }));

          case 9:
            return _context2.abrupt("return", render(store, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey));

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _renderSSR.apply(this, arguments);
}