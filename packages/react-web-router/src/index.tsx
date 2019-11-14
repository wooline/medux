import {RootState as BaseRootState, ModuleGetter, StoreOptions} from '@medux/core/types/export';
import {BrowserRoutePayload, Location, RouteConfig, ToBrowserUrl, TransformRoute, buildToBrowserUrl, buildTransformRoute, getBrowserRouteActions} from '@medux/route-plan-a';
import {History, createLocation} from 'history';
import React, {ReactElement} from 'react';
import {Router, StaticRouter, withRouter} from 'react-router-dom';
import {renderApp, renderSSR} from '@medux/react';
import {renderToNodeStream, renderToString} from 'react-dom/server';

import ReactDOM from 'react-dom';
import {createHistory} from '@medux/web';

export {loadView, exportModule} from '@medux/react';
export {ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer} from '@medux/core';
export {setRouteConfig} from '@medux/route-plan-a';

export type RouteData = import('@medux/core/types/export').RouteData;
export type LoadView<MG extends ModuleGetter, OPTS> = import('@medux/core/types/export').LoadView<MG, OPTS>;
export type BaseModelState<R = {[key: string]: any}> = import('@medux/core/types/export').BaseModelState<R>;
export type BrowserRoutePayloadd<P> = import('@medux/route-plan-a').BrowserRoutePayload<P>;
export type RouteConfig = import('@medux/route-plan-a').RouteConfig;
export type ToBrowserUrl<Params> = import('@medux/route-plan-a').ToBrowserUrl<Params>;
export type BrowserHistoryActions<Params> = import('@medux/route-plan-a').BrowserHistoryActions<BrowserRoutePayload<Params>>;

let historyActions: BrowserHistoryActions<RouteData> | undefined = undefined;
let transformRoute: TransformRoute | undefined = undefined;

export function getBrowserHistory<Params>(): {historyActions: BrowserHistoryActions<Params>; toUrl: ToBrowserUrl<Params>} {
  return {historyActions: getBrowserRouteActions<Params>(() => historyActions!), toUrl: buildToBrowserUrl(() => transformRoute!)};
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
