import { createHistory } from '@medux/web';
import React from 'react';
import { Router, StaticRouter, withRouter } from 'react-router-dom';
import { renderApp, renderSSR } from '@medux/react';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import ReactDOM from 'react-dom'; //TODO use StaticRouter

export { loadView, exportModule } from '@medux/react';
export { ActionTypes, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
let historyActions = undefined;
export function getHistoryActions() {
  return historyActions;
}
export function buildApp(moduleGetter, appModuleName, history, transformRoute, storeOptions, container) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (container === void 0) {
    container = 'root';
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
export function buildSSR(moduleGetter, appModuleName, location, transformRoute, storeOptions, renderToStream) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  const historyData = createHistory({}, transformRoute);
  const {
    historyProxy
  } = historyData;
  historyProxy.initialized = false;
  historyActions = historyData.historyActions;
  const render = renderToStream ? renderToNodeStream : renderToString;
  return renderSSR((Provider, AppMainView) => {
    return render(React.createElement(Provider, null, React.createElement(StaticRouter, {
      location: location
    }, React.createElement(AppMainView, null))));
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
//# sourceMappingURL=index.js.map