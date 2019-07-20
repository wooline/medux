import React, { useState } from 'react';
import { exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView } from '@medux/core';
import { Provider } from 'react-redux';
export function renderApp(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  return baseRenderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var ReduxProvider = function ReduxProvider(props) {
      // eslint-disable-next-line react/prop-types
      return React.createElement(Provider, {
        store: store
      }, props.children);
    };

    render(ReduxProvider, appViews.Main, ssrInitStoreKey);
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
export function renderSSR(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return baseRenderSSR(function (store, appModel, appViews, ssrInitStoreKey) {
    var data = store.getState();

    var ReduxProvider = function ReduxProvider(props) {
      // eslint-disable-next-line react/prop-types
      return React.createElement(Provider, {
        store: store
      }, props.children);
    };

    return {
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: render(ReduxProvider, appViews.Main)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
export var loadView = function loadView(moduleGetter, moduleName, viewName, Loading) {
  var loader = function Loader(props) {
    var _useState = useState(function () {
      var moduleViewResult = getView(moduleGetter, moduleName, viewName);

      if (isPromiseView(moduleViewResult)) {
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

    return view ? React.createElement(view.Component, props) : Loading ? React.createElement(Loading, props) : null;
  };

  return loader;
};
export var exportModule = baseExportModule;
//# sourceMappingURL=index.js.map