import {RootState as BaseRootState, ModuleGetter, RouteData, StoreOptions} from '@medux/core/types/export';
import {BrowserHistoryOptions, BrowserLocation, HistoryActions, MemoryHistoryOptions, createHistory} from '@medux/web';
import React, {ReactElement} from 'react';
import {Router, withRouter} from 'react-router-dom';
import {renderApp, renderSSR} from '@medux/react';
import {renderToNodeStream, renderToString} from 'react-dom/server';

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
  historyOptions: BrowserHistoryOptions,
  storeOptions: StoreOptions = {},
  container: string | Element | ((component: ReactElement<any>) => void) = 'root'
): Promise<void> {
  const historyData = createHistory(historyOptions);
  const {history, historyProxy} = historyData;
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
  historyOptions: MemoryHistoryOptions,
  storeOptions: StoreOptions = {},
  renderToStream: boolean = false
): Promise<{html: string | ReadableStream; data: any; ssrInitStoreKey: string}> {
  const historyData = createHistory(historyOptions);
  const {history, historyProxy} = historyData;
  historyActions = historyData.historyActions;

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
