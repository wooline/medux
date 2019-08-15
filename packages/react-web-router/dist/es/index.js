import { buildToBrowserUrl, buildTransformRoute, getBrowserRouteActions } from '@medux/route-plan-a';
import { createLocation } from 'history';
import React from 'react';
import { Router, StaticRouter, withRouter } from 'react-router-dom';
import { renderApp, renderSSR } from '@medux/react';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import ReactDOM from 'react-dom';
import { createHistory } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
let historyActions = undefined;
let transformRoute = undefined;
export function getBrowserHistoryActions() {
  return getBrowserRouteActions(() => historyActions);
}
export const toBrowserUrl = buildToBrowserUrl(() => transformRoute);
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

  const historyData = createHistory(history, transformRoute);
  const {
    historyProxy
  } = historyData;
  historyActions = historyData.historyActions;
  return renderApp((Provider, AppMainView, ssrInitStoreKey) => {
    const WithRouter = withRouter(AppMainView);
    const app = React.createElement(Provider, null, React.createElement(Router, {
      history: history
    }, React.createElement(WithRouter, null)));

    if (typeof container === 'function') {
      container(app);
    } else {
      const render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
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

  const historyData = createHistory({
    listen: () => void 0,
    location: createLocation(location)
  }, transformRoute);
  const {
    historyProxy
  } = historyData;
  historyActions = historyData.historyActions;
  const render = renderToStream ? renderToNodeStream : renderToString;
  return renderSSR((Provider, AppMainView) => {
    return render(React.createElement(Provider, null, React.createElement(StaticRouter, {
      location: location
    }, React.createElement(AppMainView, null))));
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
//# sourceMappingURL=index.js.map