import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import { MetaData } from './basic';
import { cacheModule, getModuleByName, loadModel } from './inject';
import { Controller } from './store';
import { env } from './env';

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

var defFun = function defFun() {
  return undefined;
};

export var createApp = function createApp(storeCreator, render, ssr, preModules, moduleGetter, appModuleOrName, appViewName) {
  if (preModules === void 0) {
    preModules = [];
  }

  if (appModuleOrName === void 0) {
    appModuleOrName = 'app';
  }

  if (appViewName === void 0) {
    appViewName = 'Main';
  }

  var appModuleName = typeof appModuleOrName === 'string' ? appModuleOrName : appModuleOrName.default.moduleName;
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;

  if (typeof appModuleOrName !== 'string') {
    cacheModule(appModuleOrName);
  }

  return {
    useStore: function useStore(storeOptions) {
      var controller = new Controller(storeOptions.middlewares);
      var store = storeCreator(controller, storeOptions);
      return {
        store: store,
        ssr: function (_ssr) {
          function ssr(_x) {
            return _ssr.apply(this, arguments);
          }

          ssr.toString = function () {
            return _ssr.toString();
          };

          return ssr;
        }(function (renderOptions) {
          return _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
            var appModule;
            return _regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return getModuleByName(appModuleName);

                  case 2:
                    appModule = _context.sent;
                    preModules = preModules.filter(function (item) {
                      return moduleGetter[item] && item !== appModuleName;
                    });
                    preModules.unshift(appModuleName);
                    _context.next = 7;
                    return Promise.all(preModules.map(function (moduleName) {
                      return loadModel(moduleName, controller);
                    }));

                  case 7:
                    controller.dispatch = defFun;
                    return _context.abrupt("return", ssr(store, appModule.default.views[appViewName], renderOptions));

                  case 9:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }))();
        }),
        render: function (_render) {
          function render(_x2) {
            return _render.apply(this, arguments);
          }

          render.toString = function () {
            return _render.toString();
          };

          return render;
        }(function (renderOptions) {
          return _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
            var appModule;
            return _regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (reRenderTimer) {
                      env.clearTimeout(reRenderTimer);
                      reRenderTimer = 0;
                    }

                    MetaData.clientController = controller;
                    _context2.next = 4;
                    return getModuleByName(appModuleName);

                  case 4:
                    appModule = _context2.sent;
                    appModule.default.model(controller);
                    preModules = preModules.filter(function (item) {
                      return moduleGetter[item] && item !== appModuleName;
                    });

                    if (!preModules.length) {
                      _context2.next = 10;
                      break;
                    }

                    _context2.next = 10;
                    return Promise.all(preModules.map(function (moduleName) {
                      return getModuleByName(moduleName);
                    }));

                  case 10:
                    reRender = render(store, appModule.default.views[appViewName], renderOptions);

                  case 11:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }))();
        })
      };
    }
  };
};