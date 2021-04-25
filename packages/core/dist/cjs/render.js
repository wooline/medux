"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.viewHotReplacement = viewHotReplacement;
exports.createApp = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _basic = require("./basic");

var _inject = require("./inject");

var _store = require("./store");

var _env = require("./env");

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

var defFun = function defFun() {
  return undefined;
};

var createApp = function createApp(storeCreator, render, ssr, preModules, moduleGetter, appModuleOrName, appViewName) {
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
  _basic.MetaData.appModuleName = appModuleName;
  _basic.MetaData.appViewName = appViewName;
  _basic.MetaData.moduleGetter = moduleGetter;

  if (typeof appModuleOrName !== 'string') {
    (0, _inject.cacheModule)(appModuleOrName);
  }

  return {
    useStore: function useStore(storeOptions) {
      var controller = new _store.Controller(storeOptions.middlewares);
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
          return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee() {
            var appModule;
            return _regenerator.default.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return (0, _inject.getModuleByName)(appModuleName);

                  case 2:
                    appModule = _context.sent;
                    preModules = preModules.filter(function (item) {
                      return moduleGetter[item] && item !== appModuleName;
                    });
                    preModules.unshift(appModuleName);
                    _context.next = 7;
                    return Promise.all(preModules.map(function (moduleName) {
                      return (0, _inject.loadModel)(moduleName, controller);
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
          return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2() {
            var appModule;
            return _regenerator.default.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (reRenderTimer) {
                      _env.env.clearTimeout(reRenderTimer);

                      reRenderTimer = 0;
                    }

                    _basic.MetaData.clientController = controller;
                    _context2.next = 4;
                    return (0, _inject.getModuleByName)(appModuleName);

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
                      return (0, _inject.getModuleByName)(moduleName);
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

exports.createApp = createApp;