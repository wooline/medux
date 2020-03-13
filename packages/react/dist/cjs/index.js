'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var core = require('@medux/core');
var reactRedux = require('react-redux');

function renderApp(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  return core.renderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var ReduxProvider = function ReduxProvider(props) {
      return React__default.createElement(reactRedux.Provider, {
        store: store
      }, props.children);
    };

    render(ReduxProvider, appViews.Main, ssrInitStoreKey);
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
function renderSSR(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return core.renderSSR(function (store, appModel, appViews, ssrInitStoreKey) {
    var data = store.getState();

    var ReduxProvider = function ReduxProvider(props) {
      return React__default.createElement(reactRedux.Provider, {
        store: store
      }, props.children);
    };

    return {
      store: store,
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: render(ReduxProvider, appViews.Main)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
var loadView = function loadView(moduleName, viewName, modelOptions, Loading) {
  var loader = function ViewLoader(props) {
    var _useState = React.useState(function () {
      var moduleViewResult = core.getView(moduleName, viewName, modelOptions);

      if (core.isPromiseView(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          Object.keys(loader).forEach(function (key) {
            return Component[key] = loader[key];
          });
          Object.keys(Component).forEach(function (key) {
            return loader[key] = Component[key];
          });
          setView({
            Component: Component
          });
        });
        return null;
      } else {
        Object.keys(loader).forEach(function (key) {
          return moduleViewResult[key] = loader[key];
        });
        Object.keys(moduleViewResult).forEach(function (key) {
          return loader[key] = moduleViewResult[key];
        });
        return {
          Component: moduleViewResult
        };
      }
    }),
        view = _useState[0],
        setView = _useState[1];

    return view ? React__default.createElement(view.Component, props) : Loading ? React__default.createElement(Loading, props) : null;
  };

  return loader;
};
var exportModule = core.exportModule;

exports.exportModule = exportModule;
exports.loadView = loadView;
exports.renderApp = renderApp;
exports.renderSSR = renderSSR;
