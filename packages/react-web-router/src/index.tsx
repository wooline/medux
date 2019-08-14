import {RootState as BaseRootState, ModuleGetter, RouteData, StoreOptions} from '@medux/core/types/export';
import {HistoryActions, Location, TransformRoute, createHistory} from '@medux/web';
import React, {ReactElement} from 'react';
import {Router, StaticRouter, withRouter} from 'react-router-dom';
import {renderApp, renderSSR} from '@medux/react';
import {renderToNodeStream, renderToString} from 'react-dom/server';

import {History} from 'history';
import ReactDOM from 'react-dom';

//TODO use StaticRouter

export {loadView, exportModule} from '@medux/react';

export {ActionTypes, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer} from '@medux/core';

let historyActions: HistoryActions<RouteData> | undefined = undefined;

export function getHistoryActions() {
  return historyActions!;
}

export function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appModuleName: A,
  history: History,
  transformRoute: TransformRoute,
  storeOptions: StoreOptions = {},
  container: string | Element | ((component: ReactElement<any>) => void) = 'root'
) {
  const historyData = createHistory(history, transformRoute);
  const {historyProxy} = historyData;
  historyActions = historyData.historyActions;

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
  location: string,
  transformRoute: TransformRoute,
  storeOptions: StoreOptions = {},
  renderToStream: boolean = false
): Promise<{html: string | ReadableStream; data: any; ssrInitStoreKey: string}> {
  const historyData = createHistory({listen: () => void 0} as any, transformRoute);
  const {historyProxy} = historyData;
  historyProxy.initialized = false;
  historyActions = historyData.historyActions;

  const render = renderToStream ? renderToNodeStream : renderToString;
  return renderSSR(
    (Provider, AppMainView) => {
      return render(
        <Provider>
          <StaticRouter location={location}>
            <AppMainView />
          </StaticRouter>
        </Provider>
      );
    },
    moduleGetter,
    appModuleName,
    historyProxy,
    storeOptions
  );
}

export type RootState<G extends ModuleGetter> = BaseRootState<G, Location>;
