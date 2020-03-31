import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import * as core from '@medux/core';
import { getView, isPromiseView } from '@medux/core';
import React, { useState } from 'react';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
export function renderApp(moduleGetter, appModuleName, historyProxy, storeOptions, container = 'root', beforeRender) {
  return core.renderApp((store, appModel, appViews, ssrInitStoreKey) => {
    const reduxProvider = React.createElement(Provider, {
      store: store
    }, React.createElement(appViews.Main, null));

    if (typeof container === 'function') {
      container(reduxProvider);
    } else {
      const render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
      render(reduxProvider, typeof container === 'string' ? document.getElementById(container) : container);
    }
  }, moduleGetter, appModuleName, historyProxy, storeOptions, beforeRender);
}
export function renderSSR(moduleGetter, appModuleName, historyProxy, storeOptions = {}, renderToStream = false, beforeRender) {
  return core.renderSSR((store, appModel, appViews, ssrInitStoreKey) => {
    const data = store.getState();
    const reduxProvider = React.createElement(Provider, {
      store: store
    }, React.createElement(appViews.Main, null));
    const render = renderToStream ? renderToNodeStream : renderToString;
    return {
      store,
      ssrInitStoreKey,
      data,
      html: render(reduxProvider)
    };
  }, moduleGetter, appModuleName, historyProxy, storeOptions, beforeRender);
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
export const exportModule = core.exportModule;