import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { MetaData, config, isPromise } from './basic';
import { cacheModule, injectActions, getModuleByName } from './inject';
import { buildStore } from './store';
import { env } from './env';
export function getRootModuleAPI(data) {
  if (!MetaData.facadeMap) {
    if (data) {
      MetaData.facadeMap = Object.keys(data).reduce(function (prev, moduleName) {
        var arr = data[moduleName];
        var actions = {};
        var actionNames = {};
        arr.forEach(function (actionName) {
          actions[actionName] = function () {
            for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
              payload[_key] = arguments[_key];
            }

            return {
              type: moduleName + config.NSP + actionName,
              payload: payload
            };
          };

          actionNames[actionName] = moduleName + config.NSP + actionName;
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
      MetaData.facadeMap = new Proxy({}, {
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
                  return moduleName + config.NSP + actionName;
                }
              }),
              actions: new Proxy({}, {
                get: function get(__, actionName) {
                  return function () {
                    for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      payload[_key2] = arguments[_key2];
                    }

                    return {
                      type: moduleName + config.NSP + actionName,
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

  return MetaData.facadeMap;
}

function clearHandlers(key, actionHandlerMap) {
  for (var _actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(_actionName)) {
      var maps = actionHandlerMap[_actionName];
      delete maps[key];
    }
  }
}

export function modelHotReplacement(moduleName, ActionHandles) {
  var store = MetaData.clientStore;
  var prevInitState = store._medux_.injectedModules[moduleName];

  if (prevInitState) {
    clearHandlers(moduleName, store._medux_.reducerMap);
    clearHandlers(moduleName, store._medux_.effectMap);
    var handlers = new ActionHandles();
    handlers.moduleName = moduleName;
    handlers.store = store;
    handlers.actions = MetaData.facadeMap[moduleName].actions;
    injectActions(store, moduleName, handlers);
    env.console.log("[HMR] @medux Updated model: " + moduleName);
  }
}

var reRender = function reRender() {
  return undefined;
};

var reRenderTimer = 0;
var appView = null;
export function viewHotReplacement(moduleName, views) {
  var module = MetaData.moduleGetter[moduleName]();

  if (module) {
    module.default.views = views;
    env.console.warn("[HMR] @medux Updated views: " + moduleName);
    appView = MetaData.moduleGetter[MetaData.appModuleName]().default.views[MetaData.appViewName];

    if (!reRenderTimer) {
      reRenderTimer = env.setTimeout(function () {
        reRenderTimer = 0;
        reRender(appView);
        env.console.warn("[HMR] @medux view re rendering");
      }, 0);
    }
  } else {
    throw 'views cannot apply update for HMR.';
  }
}
export function renderApp(_x, _x2, _x3, _x4, _x5, _x6) {
  return _renderApp.apply(this, arguments);
}

function _renderApp() {
  _renderApp = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(render, moduleGetter, appModuleOrName, appViewName, storeOptions, startup) {
    var appModuleName, store, appModuleResult, appModule;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (storeOptions === void 0) {
              storeOptions = {};
            }

            if (reRenderTimer) {
              env.clearTimeout.call(null, reRenderTimer);
              reRenderTimer = 0;
            }

            appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
            MetaData.appModuleName = appModuleName;
            MetaData.appViewName = appViewName;
            MetaData.moduleGetter = moduleGetter;

            if (typeof appModuleOrName !== 'string') {
              cacheModule(appModuleOrName);
            }

            store = buildStore(storeOptions.initData || {}, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            appModuleResult = getModuleByName(appModuleName, moduleGetter);

            if (!isPromise(appModuleResult)) {
              _context.next = 15;
              break;
            }

            _context.next = 12;
            return appModuleResult;

          case 12:
            appModule = _context.sent;
            _context.next = 16;
            break;

          case 15:
            appModule = appModuleResult;

          case 16:
            startup(store, appModule);
            _context.next = 19;
            return appModule.default.model(store);

          case 19:
            reRender = render(store, appModule.default.views[appViewName]);
            return _context.abrupt("return", {
              store: store
            });

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _renderApp.apply(this, arguments);
}

var defFun = function defFun() {
  return undefined;
};

export function renderSSR(_x7, _x8, _x9, _x10, _x11, _x12) {
  return _renderSSR.apply(this, arguments);
}

function _renderSSR() {
  _renderSSR = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(render, moduleGetter, appModuleOrName, appViewName, storeOptions, startup) {
    var appModuleName, store, appModule;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (storeOptions === void 0) {
              storeOptions = {};
            }

            appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
            MetaData.appModuleName = appModuleName;
            MetaData.appViewName = appViewName;
            MetaData.moduleGetter = moduleGetter;

            if (typeof appModuleOrName !== 'string') {
              cacheModule(appModuleOrName);
            }

            store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            _context2.next = 9;
            return getModuleByName(appModuleName, moduleGetter);

          case 9:
            appModule = _context2.sent;
            startup(store, appModule);
            _context2.next = 13;
            return appModule.default.model(store);

          case 13:
            store.dispatch = defFun;
            return _context2.abrupt("return", render(store, appModule.default.views[appViewName]));

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _renderSSR.apply(this, arguments);
}