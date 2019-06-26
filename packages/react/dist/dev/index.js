import { ConnectedRouter, connectRouter, routerMiddleware } from 'connected-react-router';
import React, { useEffect, useState } from 'react';
import { exportModule as baseExportModule, getView, invalidview, isPromiseView, renderApp, renderSSR, viewWillMount, viewWillUnmount } from '@medux/core';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router-dom';
export { routerActions } from 'connected-react-router';
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
    var routerData = router(state, action);

    if (storeOptions.routerParser && state !== routerData) {
      return storeOptions.routerParser(routerData, state);
    } else {
      return routerData;
    }
  }; // SSR需要数据是单向的，store->view，不能store->view->store->view，而view:ConnectedRouter初始化时会触发一次LOCATION_CHANGE


  var routerInited = false;

  var filterRouter = function filterRouter() {
    return function (next) {
      return function (action) {
        if (action.type === '@@router/LOCATION_CHANGE') {
          if (!routerInited) {
            routerInited = true;
            return action;
          } else {
            invalidview();
          }
        }

        return next(action);
      };
    };
  };

  storeOptions.middlewares = storeOptions.middlewares || [];
  storeOptions.middlewares.unshift(filterRouter, routerMiddleware(history));
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

  var routerInited = false;

  var filterRouter = function filterRouter() {
    return function (next) {
      return function (action) {
        if (action.type === '@@router/LOCATION_CHANGE') {
          if (!routerInited) {
            routerInited = true;
            return action;
          } else {
            invalidview();
          }
        }

        return next(action);
      };
    };
  };

  storeOptions.middlewares = storeOptions.middlewares || [];
  storeOptions.middlewares.unshift(filterRouter, routerMiddleware(history));
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