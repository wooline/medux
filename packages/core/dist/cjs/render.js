"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.viewHotReplacement = viewHotReplacement;
exports.renderApp = renderApp;
exports.ssrApp = ssrApp;

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

function renderApp(baseStore, preLoadModules, moduleGetter, middlewares, appModuleName, appViewName) {
  if (appModuleName === void 0) {
    appModuleName = 'app';
  }

  if (appViewName === void 0) {
    appViewName = 'main';
  }

  _basic.MetaData.appModuleName = appModuleName;
  _basic.MetaData.appViewName = appViewName;

  if (!_basic.MetaData.moduleGetter) {
    _basic.MetaData.moduleGetter = moduleGetter;
  }

  var store = (0, _store.enhanceStore)(baseStore, middlewares);
  preLoadModules = preLoadModules.filter(function (item) {
    return moduleGetter[item] && item !== appModuleName;
  });
  return {
    store: store,
    beforeRender: function beforeRender() {
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

                _basic.MetaData.clientStore = store;
                _context.next = 4;
                return (0, _inject.loadModel)(appModuleName, store);

              case 4:
                _context.next = 6;
                return Promise.all(preLoadModules.map(function (moduleName) {
                  return (0, _inject.loadModel)(moduleName, store);
                }));

              case 6:
                appModule = (0, _inject.getModuleByName)(appModuleName);
                return _context.abrupt("return", {
                  appView: appModule.default.views[appViewName],
                  setReRender: function setReRender(hotRender) {
                    reRender = hotRender;
                  }
                });

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    }
  };
}

function ssrApp(baseStore, preLoadModules, moduleGetter, middlewares, appModuleName, appViewName) {
  if (appModuleName === void 0) {
    appModuleName = 'app';
  }

  if (appViewName === void 0) {
    appViewName = 'main';
  }

  _basic.MetaData.appModuleName = appModuleName;
  _basic.MetaData.appViewName = appViewName;

  if (!_basic.MetaData.moduleGetter) {
    _basic.MetaData.moduleGetter = moduleGetter;
  }

  var store = (0, _store.enhanceStore)(baseStore, middlewares);
  preLoadModules = preLoadModules.filter(function (item) {
    return moduleGetter[item] && item !== appModuleName;
  });
  return {
    store: store,
    beforeRender: function beforeRender() {
      return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2() {
        var appModule;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _inject.loadModel)(appModuleName, store);

              case 2:
                _context2.next = 4;
                return Promise.all(preLoadModules.map(function (moduleName) {
                  return (0, _inject.loadModel)(moduleName, store);
                }));

              case 4:
                appModule = (0, _inject.getModuleByName)(appModuleName);
                store.dispatch = defFun;
                return _context2.abrupt("return", {
                  appView: appModule.default.views[appViewName]
                });

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