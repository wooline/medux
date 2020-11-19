import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { MetaData, config } from './basic';
import { cacheModule, injectActions, getModuleByName } from './inject';
import { buildStore } from './store';
import { client, env } from './env';

function clearHandlers(key, actionHandlerMap) {
  for (var actionName in actionHandlerMap) {
    if (actionHandlerMap.hasOwnProperty(actionName)) {
      var maps = actionHandlerMap[actionName];
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
    var actions = injectActions(store, moduleName, handlers);
    handlers.actions = actions;

    if (JSON.stringify(prevInitState) !== JSON.stringify(handlers.initState)) {
      env.console.warn("[HMR] @medux Updated model initState: " + moduleName);
    }

    env.console.log("[HMR] @medux Updated model actionHandles: " + moduleName);
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
export function exportActions(moduleGetter) {
  if (!MetaData.actionCreatorMap) {
    MetaData.moduleGetter = moduleGetter;
    MetaData.actionCreatorMap = Object.keys(moduleGetter).reduce(function (maps, moduleName) {
      maps[moduleName] = typeof Proxy === 'undefined' ? {} : new Proxy({}, {
        get: function get(target, key) {
          return function () {
            for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
              payload[_key] = arguments[_key];
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
  }

  return MetaData.actionCreatorMap;
}
export function renderApp(_x, _x2, _x3, _x4, _x5, _x6) {
  return _renderApp.apply(this, arguments);
}

function _renderApp() {
  _renderApp = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(render, moduleGetter, appModuleOrName, appViewName, storeOptions, beforeRender) {
    var appModuleName, ssrInitStoreKey, initData, store, preModuleNames, appModule, i, k, _moduleName, module;

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

            if (typeof appModuleOrName !== 'string') {
              cacheModule(appModuleOrName);
            }

            ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
            initData = storeOptions.initData || {};

            if (client[ssrInitStoreKey]) {
              initData = Object.assign({}, initData, client[ssrInitStoreKey]);
            }

            store = buildStore(initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            preModuleNames = beforeRender(store);
            i = 0, k = preModuleNames.length;

          case 12:
            if (!(i < k)) {
              _context.next = 24;
              break;
            }

            _moduleName = preModuleNames[i];

            if (!moduleGetter[_moduleName]) {
              _context.next = 21;
              break;
            }

            _context.next = 17;
            return getModuleByName(_moduleName, moduleGetter);

          case 17:
            module = _context.sent;
            _context.next = 20;
            return module.default.model(store);

          case 20:
            if (i === 0) {
              appModule = module;
            }

          case 21:
            i++;
            _context.next = 12;
            break;

          case 24:
            reRender = render(store, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey);
            return _context.abrupt("return", {
              store: store
            });

          case 26:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _renderApp.apply(this, arguments);
}

export function renderSSR(_x7, _x8, _x9, _x10, _x11, _x12) {
  return _renderSSR.apply(this, arguments);
}

function _renderSSR() {
  _renderSSR = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(render, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender) {
    var ssrInitStoreKey, store, preModuleNames, appModule, i, k, _moduleName2, module;

    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (storeOptions === void 0) {
              storeOptions = {};
            }

            MetaData.appModuleName = appModuleName;
            MetaData.appViewName = appViewName;
            ssrInitStoreKey = storeOptions.ssrInitStoreKey || 'meduxInitStore';
            store = buildStore(storeOptions.initData, storeOptions.reducers, storeOptions.middlewares, storeOptions.enhancers);
            preModuleNames = beforeRender(store);
            i = 0, k = preModuleNames.length;

          case 7:
            if (!(i < k)) {
              _context2.next = 17;
              break;
            }

            _moduleName2 = preModuleNames[i];

            if (!moduleGetter[_moduleName2]) {
              _context2.next = 14;
              break;
            }

            module = moduleGetter[_moduleName2]();
            _context2.next = 13;
            return module.default.model(store);

          case 13:
            if (i === 0) {
              appModule = module;
            }

          case 14:
            i++;
            _context2.next = 7;
            break;

          case 17:
            return _context2.abrupt("return", render(store, appModule.default.model, appModule.default.views[appViewName], ssrInitStoreKey));

          case 18:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _renderSSR.apply(this, arguments);
}