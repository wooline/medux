import {RootState as BaseRootState, ModuleGetter, RouteData, StoreOptions} from '@medux/core/types/export';
import {BrowserHistoryActions, BrowserRoutePayload, RouteConfig, RoutePayload, buildTransformRoute, fillRouteData, getBrowserRouteActions} from '@medux/route-plan-a';
import {History, createLocation} from 'history';
import {HistoryActions, Location, TransformRoute, createHistory} from '@medux/web';
import React, {ReactElement} from 'react';
import {Router, StaticRouter, withRouter} from 'react-router-dom';
import {renderApp, renderSSR} from '@medux/react';
import {renderToNodeStream, renderToString} from 'react-dom/server';

import ReactDOM from 'react-dom';

export {loadView, exportModule} from '@medux/react';
export {ActionTypes, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer} from '@medux/core';
export {setRouteConfig} from '@medux/route-plan-a';

let historyActions: HistoryActions<RouteData> | undefined = undefined;
let transformRoute: TransformRoute | undefined = undefined;

export function getHistoryActions<T>(): BrowserHistoryActions<BrowserRoutePayload<T>> {
  return getBrowserRouteActions<T>(() => historyActions!);
}
export interface ToUrl<T> {
  (routeOptions: BrowserRoutePayload<T>): string;
  (pathname: string, search: string, hash: string): string;
}
export function toUrl(routeOptions: BrowserRoutePayload<any>): string;
export function toUrl(pathname: string, search: string, hash: string): string;
export function toUrl(...args: any[]): string {
  if (args.length === 1) {
    const location = transformRoute!.routeToLocation(fillRouteData(args[0] as RoutePayload<any>));
    args = [location.pathname, location.search, location.hash];
  }
  const [pathname, search, hash] = args as [string, string, string];
  let url = pathname;
  if (search) {
    url += search;
  }
  if (hash) {
    url += hash;
  }
  return url;
}
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
