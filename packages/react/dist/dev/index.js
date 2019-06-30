import React, { useEffect, useState } from 'react';
import { exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView, viewWillMount, viewWillUnmount } from '@medux/core';
import { Provider } from 'react-redux';
export function renderApp(render, moduleGetter, appModuleName, storeOptions) {
  return baseRenderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var ReduxProvider = function ReduxProvider(props) {
      // eslint-disable-next-line react/prop-types
      return React.createElement(Provider, {
        store: store
      }, props.children);
    };

    render(ReduxProvider, appViews.Main, ssrInitStoreKey);
  }, moduleGetter, appModuleName, storeOptions);
}
export function renderSSR(render, moduleGetter, appModuleName, storeOptions) {
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
  }, moduleGetter, appModuleName, storeOptions);
}
export var loadView = function loadView(moduleGetter, moduleName, viewName, Loading) {
  var loader = function Loader(props) {
    var _useState = useState(function () {
      var moduleViewResult = getView(moduleGetter, moduleName, viewName);

      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          loader.propTypes = Component.propTypes;
          loader.contextTypes = Component.contextTypes;
          loader.defaultProps = Component.defaultProps;
          setView({
            Component: Component
          });
        });
        return null;
      } else {
        loader.propTypes = moduleViewResult.propTypes;
        loader.contextTypes = moduleViewResult.contextTypes;
        loader.defaultProps = moduleViewResult.defaultProps;
        return {
          Component: moduleViewResult
        };
      }
    }),
        view = _useState[0],
        setView = _useState[1];

    useEffect(function () {
      if (view) {
        viewWillMount(moduleName, viewName);
        return function () {
          viewWillUnmount(moduleName, viewName);
        };
      } else {
        return void 0;
      }
    }, [view]);
    return view ? React.createElement(view.Component, props) : Loading ? React.createElement(Loading, props) : null;
  };

  return loader;
};
export var exportModule = baseExportModule;
//# sourceMappingURL=index.js.map