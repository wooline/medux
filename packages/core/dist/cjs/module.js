"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getRootModuleAPI = getRootModuleAPI;
exports.modelHotReplacement = modelHotReplacement;
exports.viewHotReplacement = viewHotReplacement;
exports.renderApp = renderApp;
exports.renderSSR = renderSSR;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _basic = require("./basic");

var _inject = require("./inject");

var _store = require("./store");

var _env = require("./env");

function getRootModuleAPI(data) {
  if (!_basic.MetaData.facadeMap) {
    if (data) {
      _basic.MetaData.facadeMap = Object.keys(data).reduce(function (prev, moduleName) {
        var obj = data[moduleName];
        var actions = {};
        var actionNames = {};
        Object.keys(obj.actionNames).forEach(function (actionName) {
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
        var viewNames = {};
        Object.keys(obj.viewNames).forEach(function (viewName) {
          viewNames[viewName] = moduleName + _basic.config.VSP + viewName;
        });
        var moduleFacade = {
          name: moduleName,
          actions: actions,
          actionNames: actionNames,
          viewNames: viewNames
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
              viewNames: new Proxy({}, {
                get: function get(__, viewName) {
                  return moduleName + _basic.config.VSP + viewName;
                }
              }),
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

function clearHandlers(key, actionHandlerMap) {
  for (var _actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(_actionName)) {
      var maps = actionHandlerMap[_actionName];
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
    handlers.actions = _basic.MetaData.facadeMap[moduleName].actions;
    (0, _inject.injectActions)(store, moduleName, handlers);

    _env.env.console.log("[HMR] @medux Updated model: " + moduleName);
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