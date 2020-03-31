import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import * as core from '@medux/core';
import { getView, isPromiseView } from '@medux/core';
import React, { useState } from 'react';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
export function renderApp(moduleGetter, appModuleName, historyProxy, storeOptions, container, beforeRender) {
  if (container === void 0) {
    container = 'root';
  }

  return core.renderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var reduxProvider = React.createElement(Provider, {
      store: store
    }, React.createElement(appViews.Main, null));

    if (typeof container === 'function') {
      container(reduxProvider);
    } else {
      var render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
      render(reduxProvider, typeof container === 'string' ? document.getElementById(container) : container);
    }
  }, moduleGetter, appModuleName, historyProxy, storeOptions, beforeRender);
}
export function renderSSR(moduleGetter, appModuleName, historyProxy, storeOptions, renderToStream, beforeRender) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  return core.renderSSR(function (store, appModel, appViews, ssrInitStoreKey) {
    var data = store.getState();
    var reduxProvider = React.createElement(Provider, {
      store: store
    }, React.createElement(appViews.Main, null));
    var render = renderToStream ? renderToNodeStream : renderToString;
    return {
      store: store,
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: render(reduxProvider)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions, beforeRender);
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
export var exportModule = core.exportModule;