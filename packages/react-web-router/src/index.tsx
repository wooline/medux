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
export type {
  RouteModuleState as BaseModuleState,
  RootState,
  RouteState,
  RoutePayload,
  LocationTransform,
  PathnameTransform,
  NativeLocation,
  PagenameMap,
  HistoryAction,
  Location,
  DeepPartial,
} from '@medux/route-web';
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
  deepMerge,
  deepMergeState,
  isProcessedError,
  setProcessedError,
} from '@medux/core';
export {RouteModuleHandlers as BaseModuleHandlers, createLocationTransform, createPathnameTransform} from '@medux/route-web';
export {exportApp, patchActions} from './sington';
export {DocumentHead} from './components/DocumentHead';
export {Else} from './components/Else';
export {Switch} from './components/Switch';
export {Link} from './components/Link';

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
  appExports.router = createRouter(historyType, locationTransform);

  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }
  storeOptions.middlewares.unshift(routeMiddleware);
  if (!storeOptions.reducers) {
    storeOptions.reducers = {};
  }
  storeOptions.reducers.route = routeReducer;
  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }
  storeOptions.initData = mergeState(storeOptions.initData, {route: appExports.router.getRouteState()});

  return renderApp<ComponentType<any>>(
    (store, appModel, AppView, ssrInitStoreKey) => {
      const reRender = (View: ComponentType<any>) => {
        const panel: any = typeof container === 'string' ? env.document.getElementById(container) : container;
        unmountComponentAtNode(panel!);
        const renderFun = env[ssrInitStoreKey] ? hydrate : render;
        renderFun(<View store={store} />, panel);
      };
      reRender(AppView);
      return reRender;
    },
    moduleGetter,
    appModuleName,
    appViewName,
    storeOptions,
    (store) => {
      appExports.store = store as any;
      appExports.router.setStore(store);
      const routeState = appExports.router.getRouteState();
      return Object.keys(routeState.params);
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
    // @ts-ignore
    SSRTPL = Buffer.from('process.env.MEDUX_ENV_SSRTPL', 'base64').toString();
  }
  appExports.request = request;
  appExports.response = response;
  appExports.router = createRouter(request.url, locationTransform);
  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }
  storeOptions.initData = mergeState(storeOptions.initData, {route: appExports.router.getRouteState()});
  return renderSSR<ComponentType<any>>(
    (store, appModel, AppView, ssrInitStoreKey) => {
      const data = store.getState();
      return {
        store,
        ssrInitStoreKey,
        data,
        // @ts-ignore
        html: require('react-dom/server').renderToString(<AppView store={store} />),
      };
    },
    moduleGetter,
    appModuleName,
    appViewName,
    storeOptions,
    (store) => {
      appExports.store = store as any;
      Object.defineProperty(appExports, 'state', {
        get: () => {
          return store.getState();
        },
      });
      appExports.router.setStore(store);
      const routeState = appExports.router.getRouteState();
      return Object.keys(routeState.params);
    }
  ).then(({html, data, ssrInitStoreKey}) => {
    const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${container}['"][^<>]*>`, 'm'));
    if (match) {
      const pageHead = html.split(/<head>|<\/head>/, 3);
      html = pageHead[0] + pageHead[2];
      return SSRTPL.replace('</head>', `${pageHead[1]}\r\n<script>window.${ssrInitStoreKey} = ${JSON.stringify(data)};</script>\r\n</head>`).replace(match[0], match[0] + html);
    }
    return html;
  });
}
