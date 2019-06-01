import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import createMemoryHistory from 'history/createMemoryHistory';
import { withRouter } from 'react-router-dom';
import { ConnectedRouter, connectRouter, routerMiddleware } from 'connected-react-router';
import { renderApp, renderSSR, getView, isPromiseView, viewWillMount, viewWillUnmount, isServer, getClientStore } from '@medux/core';
export function buildApp(moduleGetter, appModuleName, storeOptions, container) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (container === void 0) {
    container = 'root';
  }

  var history = createBrowserHistory();
  storeOptions.reducers = storeOptions.reducers || {};

  if (storeOptions.reducers && storeOptions.reducers.router) {
    throw new Error("the reducer name 'router' is not allowed");
  }

  var router = connectRouter(history);

  storeOptions.reducers.router = function (state, action) {
    var routerData = router(state.router, action);

    if (storeOptions.routerParser && state.router !== routerData) {
      state.router = storeOptions.routerParser(routerData, state.router);
    } else {
      state.router = routerData;
    }
  };

  storeOptions.middlewares = storeOptions.middlewares || [];
  storeOptions.middlewares.unshift(routerMiddleware(history));
  return renderApp(function (store, appModel, appViews, ssrInitStoreKey) {
    var WithRouter = withRouter(appViews.Main);
    var app = React.createElement(Provider, {
      store: store
    }, React.createElement(ConnectedRouter, {
      history: history
    }, React.createElement(WithRouter, null)));

    if (typeof container === 'function') {
      container(app);
    } else {
      var render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
      render(app, typeof container === 'string' ? document.getElementById(container) : container);
    }
  }, moduleGetter, appModuleName, storeOptions);
}
export function buildSSR(moduleGetter, appModuleName, initialEntries, storeOptions, renderToStream) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  var history = createMemoryHistory({
    initialEntries: initialEntries
  });
  storeOptions.reducers = storeOptions.reducers || {};

  if (storeOptions.reducers && storeOptions.reducers.router) {
    throw new Error("the reducer name 'router' is not allowed");
  }

  var router = connectRouter(history);

  storeOptions.reducers.router = function (state, action) {
    var routerData = router(state.router, action);

    if (storeOptions.routerParser && state.router !== routerData) {
      state.router = storeOptions.routerParser(routerData, state.router);
    } else {
      state.router = routerData;
    }
  };

  storeOptions.middlewares = storeOptions.middlewares || [];
  storeOptions.middlewares.unshift(routerMiddleware(history));
  var render = renderToStream ? renderToNodeStream : renderToString;
  return renderSSR(function (store, appModel, appViews, ssrInitStoreKey) {
    var data = store.getState();
    return {
      ssrInitStoreKey: ssrInitStoreKey,
      data: data,
      html: render(React.createElement(Provider, {
        store: store
      }, React.createElement(ConnectedRouter, {
        history: history
      }, React.createElement(appViews.Main, null))))
    };
  }, moduleGetter, appModuleName, storeOptions);
}
export var loadView = function loadView(moduleGetter, moduleName, viewName, loadingComponent) {
  if (loadingComponent === void 0) {
    loadingComponent = null;
  }

  return function Loading(props) {
    var _useState = useState(function () {
      var moduleViewResult = getView(moduleGetter[moduleName], viewName);

      if (isPromiseView(moduleViewResult)) {
        moduleViewResult.then(function (view) {
          setComponent(view);
        });
        return null;
      } else {
        return moduleViewResult;
      }
    }),
        Component = _useState[0],
        setComponent = _useState[1];

    return Component ? React.createElement(Component, props) : loadingComponent;
  };
};
export var exportView = function exportView(ComponentView, model, viewName) {
  if (isServer()) {
    return ComponentView;
  } else {
    return function View(props) {
      var _useState2 = useState(function () {
        var state = getClientStore().getState();
        var namespace = model.namespace;
        model(getClientStore()).then(function () {
          if (!modelReady) {
            setModelReady(true);
          }
        });
        return !!state[namespace];
      }),
          modelReady = _useState2[0],
          setModelReady = _useState2[1];

      useEffect(function () {
        viewWillMount(model.namespace, viewName);
        return function () {
          viewWillUnmount(model.namespace, viewName);
        };
      }, []);
      return modelReady ? React.createElement(ComponentView, props) : null;
    };
  }
};
//# sourceMappingURL=index.js.map