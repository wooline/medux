import { createHistory } from '@medux/web';
import React from 'react';
import { Router, withRouter } from 'react-router-dom';
import { renderApp, renderSSR } from '@medux/react';
import { renderToNodeStream, renderToString } from 'react-dom/server';
import ReactDOM from 'react-dom'; //TODO use StaticRouter

export { loadView, exportModule } from '@medux/react';
export { ActionTypes, LoadingState, exportActions, BaseModelHandlers, effect, reducer } from '@medux/core';
export var historyActions = null;
export function buildApp(moduleGetter, appModuleName, historyOptions, storeOptions, container) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (container === void 0) {
    container = 'root';
  }

  var historyData = createHistory(historyOptions);
  var history = historyData.history,
      historyProxy = historyData.historyProxy;
  historyActions = historyData.historyActions; // // SSR需要数据是单向的，store->view，不能store->view->store->view，而view:ConnectedRouter初始化时会触发一次LOCATION_CHANGE
  // let routerInited = false;
  // const filterRouter = () => (next: Function) => (action: {type: string}) => {
  //   if (action.type === '@@router/LOCATION_CHANGE') {
  //     if (!routerInited) {
  //       routerInited = true;
  //       return action;
  //     } else {
  //       invalidview();
  //     }
  //   }
  //   return next(action);
  // };
  // storeOptions.middlewares = storeOptions.middlewares || [];
  // storeOptions.middlewares.unshift(filterRouter, routerMiddleware(history));

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
export function buildSSR(moduleGetter, appModuleName, historyOptions, storeOptions, renderToStream) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  if (renderToStream === void 0) {
    renderToStream = false;
  }

  var historyData = createHistory(historyOptions);
  var history = historyData.history,
      historyProxy = historyData.historyProxy;
  historyActions = historyData.historyActions; // storeOptions.reducers = storeOptions.reducers || {};
  // if (storeOptions.reducers && storeOptions.reducers.router) {
  //   throw new Error("the reducer name 'router' is not allowed");
  // }
  // const router = connectRouter(history);
  // storeOptions.reducers.router = (state, action) => {
  //   const routerData = router(state.router, action as any);
  //   if (storeOptions.routerParser && state.router !== routerData) {
  //     state.router = storeOptions.routerParser(routerData, state.router);
  //   } else {
  //     state.router = routerData;
  //   }
  // };
  // let routerInited = false;
  // const filterRouter = () => (next: Function) => (action: {type: string}) => {
  //   if (action.type === '@@router/LOCATION_CHANGE') {
  //     if (!routerInited) {
  //       routerInited = true;
  //       return action;
  //     } else {
  //       invalidview();
  //     }
  //   }
  //   return next(action);
  // };
  // storeOptions.middlewares = storeOptions.middlewares || [];
  // storeOptions.middlewares.unshift(filterRouter, routerMiddleware(history));

  var render = renderToStream ? renderToNodeStream : renderToString;
  return renderSSR(function (Provider, AppMainView) {
    return render(React.createElement(Provider, null, React.createElement(Router, {
      history: history
    }, React.createElement(AppMainView, null))));
  }, moduleGetter, appModuleName, historyProxy, storeOptions);
}
//# sourceMappingURL=index.js.map