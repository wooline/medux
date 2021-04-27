"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.viewHotReplacement = viewHotReplacement;
exports.buildApp = buildApp;

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

function buildApp(storeCreator, _render, _ssr, preLoadModules, _ref) {
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
  _basic.MetaData.appModuleName = appModuleName;
  _basic.MetaData.appViewName = appViewName;
  _basic.MetaData.moduleGetter = moduleGetter;
  var controller = new _store.Controller(storeOptions.middlewares);
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
      return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee() {
        var appModule;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (reRenderTimer) {
                  _env.env.clearTimeout(reRenderTimer);

                  reRenderTimer = 0;
                }

                _basic.MetaData.clientController = controller;
                _context.next = 4;
                return (0, _inject.getModuleByName)(appModuleName);

              case 4:
                appModule = _context.sent;
                _context.next = 7;
                return Promise.all(preLoadModules.map(function (moduleName) {
                  return (0, _inject.loadModel)(moduleName, controller);
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
      return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2() {
        var appModule;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _inject.getModuleByName)(appModuleName);

              case 2:
                appModule = _context2.sent;
                _context2.next = 5;
                return Promise.all(preLoadModules.map(function (moduleName) {
                  return (0, _inject.loadModel)(moduleName, controller);
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