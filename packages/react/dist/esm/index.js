import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useState } from 'react';
import { exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView } from '@medux/core';
import { Provider } from 'react-redux';
export function renderApp(render, moduleGetter, appModuleName, historyProxy, storeOptions) {
  return baseRenderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var ReduxProvider = function ReduxProvider(props) {
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
      return React.createElement(Provider, {
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
export var loadView = function loadView(moduleName, viewName, options, Loading) {
  var _ref = options || {},
      forwardRef = _ref.forwardRef,
      modelOptions = _objectWithoutPropertiesLoose(_ref, ["forwardRef"]);

  var Loader = function ViewLoader(props) {
    var _useState = useState(function () {
      var moduleViewResult = getView(moduleName, viewName, modelOptions);

      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          setView({
            Component: Component
          });
        });
        return null;
      } else {
        return {
          Component: moduleViewResult
        };
      }
    }),
        view = _useState[0],
        setView = _useState[1];

    var forwardRef = props.forwardRef,
        other = _objectWithoutPropertiesLoose(props, ["forwardRef"]);

    var ref = forwardRef ? {
      ref: forwardRef
    } : {};
    return view ? React.createElement(view.Component, _extends({}, other, ref)) : Loading ? React.createElement(Loading, props) : null;
  };

  var Component = forwardRef ? React.forwardRef(function (props, ref) {
    return React.createElement(Loader, _extends({}, props, {
      forwardRef: ref
    }));
  }) : Loader;
  return Component;
};
776002663516496;
export var exportModule = baseExportModule;