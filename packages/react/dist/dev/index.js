import "core-js/modules/es.object.keys";
import "core-js/modules/web.dom-collections.for-each";
import _extends from "@babel/runtime/helpers/esm/extends";
import React, { useEffect, useState } from 'react';
import { exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView, isServer, viewWillMount, viewWillUnmount } from '@medux/core';
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
var autoID = 0;
export var loadView = function loadView(moduleGetter, moduleName, viewName, Loading) {
  var vid = 0;

  var onFocus = function onFocus() {
    return viewWillMount(moduleName, viewName, vid + '');
  };

  var onBlur = function onBlur() {
    return viewWillUnmount(moduleName, viewName, vid + '');
  };

  var loader = function Loader(props) {
    var _useState = useState(function () {
      if (!isServer()) {
        vid = autoID++;
      }

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

    useEffect(function () {
      if (view) {
        var subscriptions = {
          didFocus: null,
          didBlur: null
        };

        if (props.navigation) {
          subscriptions.didFocus = props.navigation.addListener('didFocus', onFocus);
          subscriptions.didBlur = props.navigation.addListener('didBlur', onBlur);
        }

        onFocus();
        return function () {
          subscriptions.didFocus && subscriptions.didFocus.remove();
          subscriptions.didBlur && subscriptions.didBlur.remove();
          onBlur();
        };
      } else {
        return void 0;
      }
    }, [view]);
    return view ? React.createElement(view.Component, _extends({}, props, {
      onFocus: onFocus,
      onBlur: onBlur
    })) : Loading ? React.createElement(Loading, props) : null;
  };

  return loader;
};
export var exportModule = baseExportModule;
//# sourceMappingURL=index.js.map