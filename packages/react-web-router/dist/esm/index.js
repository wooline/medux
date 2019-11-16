import { createLocation } from 'history';
import { buildToBrowserUrl, buildTransformRoute, getBrowserRouteActions } from '@medux/route-plan-a';
import React from 'react';
import { Router, StaticRouter, withRouter } from 'react-router-dom';
import { renderApp, renderSSR } from '@medux/react';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import ReactDOM from 'react-dom';
import { createHistory } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
var historyActions = undefined;
var transformRoute = undefined;
export function getBrowserHistory() {
  return {
    historyActions: getBrowserRouteActions(function () {
      return historyActions;
    }),
    toUrl: buildToBrowserUrl(function () {
      return transformRoute;
    })
  };
}
export function buildApp(moduleGetter, appModuleName, history, routeConfig, storeOptions, container) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (container === void 0) {
    container = 'root';
  }

  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }

  var historyData = createHistory(history, transformRoute);
  var historyProxy = historyData.historyProxy;
  historyActions = historyData.historyActions;
  return renderApp(function (Provider, AppMainView, ssrInitStoreKey) {
    var WithRouter = withRouter(AppMainView);
    var app = React.createElement(Provider, null, React.createElement(Router, {
      history: history
    }, React.createElement(WithRouter, null)));

    if (typeof container === 'function') {
      container(app);
    } else {
      var render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
      render(app, typeof container === 'string' ? document.getElementById(container) : container);
    }
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
export function buildSSR(moduleGetter, appModuleName, location, routeConfig, storeOptions, renderToStream) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }

  var historyData = createHistory({
    listen: function listen() {
      return void 0;
    },
    location: createLocation(location)
  }, transformRoute);
  var historyProxy = historyData.historyProxy;
  historyActions = historyData.historyActions;
  var render = renderToStream ? renderToNodeStream : renderToString;
  return renderSSR(function (Provider, AppMainView) {
    return render(React.createElement(Provider, null, React.createElement(StaticRouter, {
      location: location
    }, React.createElement(AppMainView, null))));
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
//# sourceMappingURL=index.js.map