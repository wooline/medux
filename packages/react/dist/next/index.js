import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
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
export const loadView = (moduleName, viewName, options, Loading) => {
  const _ref = options || {},
        {
    forwardRef
  } = _ref,
        modelOptions = _objectWithoutPropertiesLoose(_ref, ["forwardRef"]);

  const Loader = function ViewLoader(props) {
    const [view, setView] = useState(() => {
      const moduleViewResult = getView(moduleName, viewName, modelOptions);

      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(Component => {
          setView({
            Component
          });
        });
        return null;
      } else {
        return {
          Component: moduleViewResult
        };
      }
    });

    const {
      forwardRef
    } = props,
          other = _objectWithoutPropertiesLoose(props, ["forwardRef"]);

    const ref = forwardRef ? {
      ref: forwardRef
    } : {};
    return view ? React.createElement(view.Component, _extends({}, other, ref)) : Loading ? React.createElement(Loading, props) : null;
  };

  const Component = forwardRef ? React.forwardRef((props, ref) => React.createElement(Loader, _extends({}, props, {
    forwardRef: ref
  }))) : Loader;
  return Component;
};
776002663516496;
export const exportModule = baseExportModule;