import { ConnectedRouter, connectRouter, routerMiddleware } from 'connected-react-router';
import React from 'react';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { renderApp, renderSSR } from '@medux/react';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import ReactDOM from 'react-dom';
import { invalidview } from '@medux/core';
import { withRouter } from 'react-router-dom';
export { routerActions } from 'connected-react-router';
export { loadView, exportModule } from '@medux/react';
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
  return renderApp(function (Provider, AppMainView, ssrInitStoreKey) {
    var WithRouter = withRouter(AppMainView);
    var app = React.createElement(Provider, null, React.createElement(ConnectedRouter, {
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
  return renderSSR(function (Provider, AppMainView) {
    return render(React.createElement(Provider, null, React.createElement(ConnectedRouter, {
      history: history
    }, React.createElement(AppMainView, null))));
  }, moduleGetter, appModuleName, storeOptions);
}
//# sourceMappingURL=index.js.map