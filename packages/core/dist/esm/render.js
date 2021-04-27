import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { MetaData } from './basic';
import { getModuleByName, loadModel } from './inject';
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

export function buildApp(storeCreator, _render, _ssr, preLoadModules, _ref) {
  var moduleGetter = _ref.moduleGetter,
      _ref$appModuleName = _ref.appModuleName,
      appModuleName = _ref$appModuleName === void 0 ? 'app' : _ref$appModuleName,
      _ref$appViewName = _ref.appViewName,
      appViewName = _ref$appViewName === void 0 ? 'main' : _ref$appViewName,
      _ref$storeOptions = _ref.storeOptions,
      storeOptions = _ref$storeOptions === void 0 ? {} : _ref$storeOptions,
      _ref$renderOptions = _ref.renderOptions,
      renderOptions = _ref$renderOptions === void 0 ? {} : _ref$renderOptions,
      _ref$ssrOptions = _ref.ssrOptions,
      ssrOptions = _ref$ssrOptions === void 0 ? {} : _ref$ssrOptions;
  MetaData.appModuleName = appModuleName;
  MetaData.appViewName = appViewName;
  MetaData.moduleGetter = moduleGetter;
  var controller = new Controller(storeOptions.middlewares);
  var store = storeCreator(storeOptions);
  store.dispatch = controller.dispatch;
  controller.setStore(store);
  preLoadModules = preLoadModules.filter(function (item) {
    return moduleGetter[item] && item !== appModuleName;
  });
  preLoadModules.unshift(appModuleName);
  return {
    store: store,
    render: function render() {
      return _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        var appModule;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (reRenderTimer) {
                  env.clearTimeout(reRenderTimer);
                  reRenderTimer = 0;
                }

                MetaData.clientController = controller;
                _context.next = 4;
                return getModuleByName(appModuleName);

              case 4:
                appModule = _context.sent;
                _context.next = 7;
                return Promise.all(preLoadModules.map(function (moduleName) {
                  return loadModel(moduleName, controller);
                }));

              case 7:
                reRender = _render(store, appModule.default.views[appViewName], renderOptions);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    ssr: function ssr() {
      return _asyncToGenerator(_regeneratorRuntime.mark(function _callee2() {
        var appModule;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return getModuleByName(appModuleName);

              case 2:
                appModule = _context2.sent;
                _context2.next = 5;
                return Promise.all(preLoadModules.map(function (moduleName) {
                  return loadModel(moduleName, controller);
                }));

              case 5:
                controller.dispatch = defFun;
                return _context2.abrupt("return", _ssr(store, appModule.default.views[appViewName], ssrOptions));

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    }
  };
}