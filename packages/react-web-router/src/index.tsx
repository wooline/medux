import {RootState as BaseRootState, ModuleGetter, RouteData, StoreOptions} from '@medux/core/types/export';
import {BrowserHistoryActions, BrowserRoutePayload, Location, RouteConfig, ToBrowserUrl, TransformRoute, buildToBrowserUrl, buildTransformRoute, getBrowserRouteActions} from '@medux/route-plan-a';
import {History, createLocation} from 'history';
import React, {ReactElement} from 'react';
import {Router, StaticRouter, withRouter} from 'react-router-dom';
import {renderApp, renderSSR} from '@medux/react';
import {renderToNodeStream, renderToString} from 'react-dom/server';

import ReactDOM from 'react-dom';
import {createHistory} from '@medux/web';

export {loadView, exportModule} from '@medux/react';
export {ActionTypes, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer} from '@medux/core';
export {setRouteConfig} from '@medux/route-plan-a';

let historyActions: BrowserHistoryActions<RouteData> | undefined = undefined;
let transformRoute: TransformRoute | undefined = undefined;

export function getBrowserHistoryActions<T>(): BrowserHistoryActions<BrowserRoutePayload<T>> {
  return getBrowserRouteActions<T>(() => historyActions!);
}
export const toBrowserUrl: ToBrowserUrl<any> = buildToBrowserUrl(() => transformRoute!);

export function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appModuleName: A,
  history: History,
  routeConfig: RouteConfig,
  storeOptions: StoreOptions = {},
  container: string | Element | ((component: ReactElement<any>) => void) = 'root'
) {
  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }
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
  routeConfig: RouteConfig,
  storeOptions: StoreOptions = {},
  renderToStream: boolean = false
): Promise<{html: string | ReadableStream; data: any; ssrInitStoreKey: string}> {
  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }
  const historyData = createHistory({listen: () => void 0, location: createLocation(location)} as any, transformRoute);
  const {historyProxy} = historyData;
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
