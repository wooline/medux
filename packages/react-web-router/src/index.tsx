/// <reference path="../env/global.d.ts" />
import React from 'react';
import {unmountComponentAtNode, hydrate, render} from 'react-dom';
import {routeMiddleware, routeReducer, setRouteConfig} from '@medux/route-web';
import {env, renderApp, renderSSR, mergeState, setConfig as setCoreConfig, exportModule as baseExportModule} from '@medux/core';
import {createRouter} from '@medux/route-browser';

import type {ComponentType, ReactElement} from 'react';
import type {ModuleGetter, StoreOptions, ExportModule} from '@medux/core';
import type {LocationTransform} from '@medux/route-web';
import {setLoadViewOptions} from './loadView';
import {appExports} from './sington';
import type {ServerRequest, ServerResponse} from './sington';

export type {RootModuleFacade, Dispatch} from '@medux/core';
export type {Store} from 'redux';
export type {RouteModuleState as BaseModuleState, RootState, RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial} from '@medux/route-web';
export type {LoadView} from './loadView';
export type {FacadeExports, ServerRequest, ServerResponse} from './sington';

export {
  ActionTypes,
  delayPromise,
  LoadingState,
  modelHotReplacement,
  effect,
  errorAction,
  reducer,
  viewHotReplacement,
  setLoading,
  logger,
  setLoadingDepthTime,
  isServer,
  serverSide,
  clientSide,
  deepMerge,
  deepMergeState,
  isProcessedError,
  setProcessedError,
} from '@medux/core';
export {RouteModuleHandlers as BaseModuleHandlers, createLocationTransform} from '@medux/route-web';
export {exportApp, patchActions} from './sington';
export {DocumentHead} from './components/DocumentHead';
export {Else} from './components/Else';
export {Switch} from './components/Switch';
export {Link} from './components/Link';

let SSRKey = 'meduxInitStore';

export function setConfig(conf: {
  RSP?: string;
  actionMaxHistory?: number;
  pagesMaxHistory?: number;
  pagenames?: {[key: string]: string};
  NSP?: string;
  MSP?: string;
  SSRKey?: string;
  MutableData?: boolean;
  DEVTOOLS?: boolean;
  LoadViewOnError?: ReactElement;
  LoadViewOnLoading?: ReactElement;
}) {
  setCoreConfig(conf);
  setRouteConfig(conf);
  setLoadViewOptions(conf);
  conf.SSRKey && (SSRKey = conf.SSRKey);
}

export const exportModule: ExportModule<ComponentType<any>> = baseExportModule;

export function buildApp(
  moduleGetter: ModuleGetter,
  {
    appModuleName = 'app',
    appViewName = 'main',
    historyType = 'Browser',
    locationTransform,
    storeOptions = {},
    container = 'root',
  }: {
    appModuleName?: string;
    appViewName?: string;
    historyType?: 'Browser' | 'Hash' | 'Memory';
    locationTransform: LocationTransform<any>;
    storeOptions?: StoreOptions;
    container?: string | Element;
  }
) {
  const router = createRouter(historyType, locationTransform);
  appExports.router = router;
  const {middlewares = [], reducers = {}, initData = {}} = storeOptions;
  middlewares.unshift(routeMiddleware);
  reducers.route = routeReducer;
  const ssrData = env[SSRKey];
  initData.route = router.getRouteState();

  return renderApp<ComponentType<any>>(
    (store, AppView) => {
      const reRender = (View: ComponentType<any>) => {
        const panel: any = typeof container === 'string' ? env.document.getElementById(container) : container;
        unmountComponentAtNode(panel!);
        const renderFun = ssrData ? hydrate : render;
        renderFun(<View store={store} />, panel);
      };
      reRender(AppView);
      return reRender;
    },
    moduleGetter,
    appModuleName,
    appViewName,
    {...storeOptions, middlewares, reducers, initData: mergeState(initData, ssrData)},
    (store) => {
      router.setStore(store);
      appExports.store = store as any;
      Object.defineProperty(appExports, 'state', {
        get: () => {
          return store.getState();
        },
      });
    }
  );
}

let SSRTPL: string;

export function setSsrHtmlTpl(tpl: string) {
  SSRTPL = tpl;
}

export function buildSSR(
  moduleGetter: ModuleGetter,
  {
    request,
    response,
    appModuleName = 'app',
    appViewName = 'main',
    locationTransform,
    storeOptions = {},
    container = 'root',
  }: {
    appModuleName?: string;
    appViewName?: string;
    request: ServerRequest;
    response: ServerResponse;
    locationTransform: LocationTransform<any>;
    storeOptions?: StoreOptions;
    container?: string;
  }
): Promise<string> {
  if (!SSRTPL) {
    SSRTPL = env.decodeBas64('process.env.MEDUX_ENV_SSRTPL');
  }
  appExports.request = request;
  appExports.response = response;
  const router = createRouter(request.url, locationTransform);
  appExports.router = router;
  const {initData = {}} = storeOptions;
  initData.route = router.getRouteState();

  return renderSSR<ComponentType<any>>(
    (store, AppView) => {
      const data = store.getState();
      return {
        store,
        data,
        // @ts-ignore
        html: require('react-dom/server').renderToString(<AppView store={store} />),
      };
    },
    moduleGetter,
    appModuleName,
    appViewName,
    {...storeOptions, initData},
    (store) => {
      router.setStore(store);
      appExports.store = store as any;
      Object.defineProperty(appExports, 'state', {
        get: () => {
          return store.getState();
        },
      });
    }
  ).then(({html, data}) => {
    const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${container}['"][^<>]*>`, 'm'));
    if (match) {
      const pageHead = html.split(/<head>|<\/head>/, 3);
      html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
      return SSRTPL.replace('</head>', `${pageHead[1] || ''}\r\n<script>window.${SSRKey} = ${JSON.stringify(data)};</script>\r\n</head>`).replace(match[0], match[0] + html);
    }
    return html;
  });
}
