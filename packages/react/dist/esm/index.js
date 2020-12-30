import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import * as core from '@medux/core';
import { env, getView, isPromise } from '@medux/core';
import React, { useEffect, useState } from 'react';
import { renderToString } from 'react-dom/server';
import ReactDOM from 'react-dom';
export function renderApp(moduleGetter, appModuleName, appViewName, storeOptions, container, beforeRender) {
  if (container === void 0) {
    container = 'root';
  }

  return core.renderApp(function (store, appModel, AppView, ssrInitStoreKey) {
    var reRender = function reRender(View) {
      var panel = typeof container === 'string' ? env.document.getElementById(container) : container;
      ReactDOM.unmountComponentAtNode(panel);
      var render = env[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
      render(React.createElement(View, {
        store: store
      }), panel);
    };

    reRender(AppView);
    return reRender;
  }, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender);
}
export function renderSSR(moduleGetter, appModuleName, appViewName, storeOptions, beforeRender) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return core.renderSSR(function (store, appModel, AppView, ssrInitStoreKey) {
    var data = store.getState();
    return {
      store: store,
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: renderToString(React.createElement(AppView, {
        store: store
      }))
    };
  }, moduleGetter, appModuleName, appViewName, storeOptions, beforeRender);
}

var LoadViewOnError = function LoadViewOnError() {
  return React.createElement("div", null, "error");
};

export var loadView = function loadView(moduleName, viewName, options, Loading, Error) {
  var _ref = options || {},
      forwardRef = _ref.forwardRef;

  var active = true;

  var Loader = function ViewLoader(props) {
    useEffect(function () {
      return function () {
        active = false;
      };
    }, []);

    var _useState = useState(function () {
      var moduleViewResult = getView(moduleName, viewName);

      if (isPromise(moduleViewResult)) {
        moduleViewResult.then(function (Component) {
          active && setView({
            Component: Component
          });
        }).catch(function () {
          active && setView({
            Component: Error || LoadViewOnError
          });
        });
        return null;
      }

      return {
        Component: moduleViewResult
      };
    }),
        view = _useState[0],
        setView = _useState[1];

    var forwardRef2 = props.forwardRef2,
        other = _objectWithoutPropertiesLoose(props, ["forwardRef2"]);

    var ref = forwardRef ? {
      ref: forwardRef2
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