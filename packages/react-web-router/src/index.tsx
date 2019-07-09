import {RootState as BaseRootState, ModuleGetter, StoreOptions} from '@medux/core/types/export';
import {BrowserHistoryOptions, BrowserLocation, HistoryActions, MemoryHistoryOptions, createHistory} from '@medux/web';
import React, {ReactElement} from 'react';
import {Router, withRouter} from 'react-router-dom';
import {renderApp, renderSSR} from '@medux/react';
import {renderToNodeStream, renderToString} from 'react-dom/server';

import ReactDOM from 'react-dom';

//TODO use StaticRouter

export {loadView, exportModule} from '@medux/react';

export {ActionTypes, LoadingState, exportActions, BaseModelHandlers, effect, reducer} from '@medux/core';

export let historyActions: HistoryActions = null as any;

export function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appModuleName: A,
  historyOptions: BrowserHistoryOptions,
  storeOptions: StoreOptions = {},
  container: string | Element | ((component: ReactElement<any>) => void) = 'root'
): Promise<void> {
  const historyData = createHistory(historyOptions);
  const {history, historyProxy} = historyData;
  historyActions = historyData.historyActions;
  // // SSR需要数据是单向的，store->view，不能store->view->store->view，而view:ConnectedRouter初始化时会触发一次LOCATION_CHANGE
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

  return renderApp(
    (Provider, AppMainView, ssrInitStoreKey) => {
      const WithRouter = withRouter(AppMainView);
      const app = (
        <Provider>
          <Router history={history}>
            <WithRouter />
          </Router>
        </Provider>
      );
      if (typeof container === 'function') {
        container(app);
      } else {
        const render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
        render(app, typeof container === 'string' ? document.getElementById(container) : container);
      }
    },
    moduleGetter,
    appModuleName,
    historyProxy,
    storeOptions
  );
}

export function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appModuleName: A,
  historyOptions: MemoryHistoryOptions,
  storeOptions: StoreOptions = {},
  renderToStream: boolean = false
): Promise<{html: string | ReadableStream; data: any; ssrInitStoreKey: string}> {
  const historyData = createHistory(historyOptions);
  const {history, historyProxy} = historyData;
  historyActions = historyData.historyActions;
  // storeOptions.reducers = storeOptions.reducers || {};
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
  const render = renderToStream ? renderToNodeStream : renderToString;
  return renderSSR(
    (Provider, AppMainView) => {
      return render(
        <Provider>
          <Router history={history}>
            <AppMainView />
          </Router>
        </Provider>
      );
    },
    moduleGetter,
    appModuleName,
    historyProxy,
    storeOptions
  );
}

export type RootState<G extends ModuleGetter> = BaseRootState<G, BrowserLocation>;
