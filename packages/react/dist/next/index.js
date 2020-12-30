import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import * as core from '@medux/core';
import { env, getView, isPromise } from '@medux/core';
import React, { useEffect, useState } from 'react';
import { renderToString } from 'react-dom/server';
import ReactDOM from 'react-dom';
export function renderApp(moduleGetter, appModuleName, appViewName, storeOptions, container = 'root', beforeRender) {
  return core.renderApp((store, appModel, AppView, ssrInitStoreKey) => {
    const reRender = View => {
      const panel = typeof container === 'string' ? env.document.getElementById(container) : container;
      ReactDOM.unmountComponentAtNode(panel);
      const render = env[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
      render(React.createElement(View, {
        store: store
      }), panel);
    };

    reRender(AppView);
    return reRender;
  }, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender);
}
export function renderSSR(moduleGetter, appModuleName, appViewName, storeOptions = {}, beforeRender) {
  return core.renderSSR((store, appModel, AppView, ssrInitStoreKey) => {
    const data = store.getState();
    return {
      store,
      ssrInitStoreKey,
      data,
      html: renderToString(React.createElement(AppView, {
        store: store
      }))
    };
  }, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender);
}

const LoadViewOnError = () => {
  return React.createElement("div", null, "error");
};

export const loadView = (moduleName, viewName, options, Loading, Error) => {
  const {
    forwardRef
  } = options || {};
  let active = true;

  const Loader = function ViewLoader(props) {
    useEffect(() => {
      return () => {
        active = false;
      };
    }, []);
    const [view, setView] = useState(() => {
      const moduleViewResult = getView(moduleName, viewName);

      if (isPromise(moduleViewResult)) {
        moduleViewResult.then(Component => {
          active && setView({
            Component
          });
        }).catch(() => {
          active && setView({
            Component: Error || LoadViewOnError
          });
        });
        return null;
      }

      return {
        Component: moduleViewResult
      };
    });

    const {
      forwardRef2
    } = props,
          other = _objectWithoutPropertiesLoose(props, ["forwardRef2"]);

    const ref = forwardRef ? {
      ref: forwardRef2
    } : {};
    return view ? React.createElement(view.Component, _extends({}, other, ref)) : Loading ? React.createElement(Loading, props) : null;
  };

  const Component = forwardRef ? React.forwardRef((props, ref) => React.createElement(Loader, _extends({}, props, {
    forwardRef: ref
  }))) : Loader;
  return Component;
};
export const exportModule = core.exportModule;