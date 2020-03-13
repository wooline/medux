import React, { useState } from 'react';
import { exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView } from '@medux/core';
import { Provider } from 'react-redux';
export function renderApp(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  return baseRenderApp((store, appModel, appViews, ssrInitStoreKey) => {
    const ReduxProvider = props => {
      return React.createElement(Provider, {
        store: store
      }, props.children);
    };

    render(ReduxProvider, appViews.Main, ssrInitStoreKey);
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
export function renderSSR(render, moduleGetter, appModuleName, historyProxy, storeOptions = {}) {
  return baseRenderSSR((store, appModel, appViews, ssrInitStoreKey) => {
    const data = store.getState();

    const ReduxProvider = props => {
      return React.createElement(Provider, {
        store: store
      }, props.children);
    };

    return {
      store,
      ssrInitStoreKey,
      data,
      html: render(ReduxProvider, appViews.Main)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
export const loadView = (moduleName, viewName, modelOptions, Loading) => {
  const loader = function ViewLoader(props) {
    const [view, setView] = useState(() => {
      const moduleViewResult = getView(moduleName, viewName, modelOptions);

      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(Component => {
          Object.keys(loader).forEach(key => Component[key] = loader[key]);
          Object.keys(Component).forEach(key => loader[key] = Component[key]);
          setView({
            Component
          });
        });
        return null;
      } else {
        Object.keys(loader).forEach(key => moduleViewResult[key] = loader[key]);
        Object.keys(moduleViewResult).forEach(key => loader[key] = moduleViewResult[key]);
        return {
          Component: moduleViewResult
        };
      }
    });
    return view ? React.createElement(view.Component, props) : Loading ? React.createElement(Loading, props) : null;
  };

  return loader;
};
export const exportModule = baseExportModule;