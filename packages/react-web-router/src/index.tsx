/// <reference path="../env/global.d.ts" />
import React from 'react';
import {unmountComponentAtNode, hydrate, render} from 'react-dom';
import {routeMiddleware, routeReducer, setRouteConfig} from '@medux/route-plan-a';
import {env, renderApp, renderSSR, mergeState, setConfig as setCoreConfig, exportModule as baseExportModule} from '@medux/core';
import {createRouter} from '@medux/web';
import type {ComponentType} from 'react';
import type {ModuleGetter, StoreOptions, ExportModule} from '@medux/core';
import type {LocationTransform} from '@medux/web';
import {appExports} from './sington';

import type {ServerRequest, ServerResponse} from './sington';

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
} from '@medux/core';
export {RouteModuleHandlers as BaseModuleHandlers, createWebLocationTransform} from '@medux/route-plan-a';
export {exportApp, patchActions} from './sington';
export {DocumentHead} from './components/DocumentHead';
export {Else} from './components/Else';
export {Switch} from './components/Switch';
export {Link} from './components/Link';
export type {RootModuleFacade, Dispatch} from '@medux/core';
export type {Store} from 'redux';
export type {RouteModuleState as BaseModuleState, LocationMap, HistoryAction, Location, PathnameRules} from '@medux/route-plan-a';
export type {RootState, RouteState, LocationTransform} from '@medux/web';
export type {LoadView} from './loadView';
export type {FacadeExports, ServerRequest, ServerResponse} from './sington';

export function setConfig(conf: {connect?: Function; RSP?: string; historyMax?: number; homeUri?: string; NSP?: string; MSP?: string; SSRKey?: string; MutableData?: boolean; DEVTOOLS?: boolean}) {
  setCoreConfig(conf);
  setRouteConfig(conf);
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
  appExports.history = createRouter(historyType, locationTransform);
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
  storeOptions.initData = mergeState(storeOptions.initData, {route: appExports.history.getRouteState()});

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
      appExports.history.setStore(store);
      const routeState = appExports.history.getRouteState();
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
  appExports.history = createRouter(request.url, locationTransform);
  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }
  storeOptions.initData = mergeState(storeOptions.initData, {route: appExports.history.getRouteState()});
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
      appExports.history.setStore(store);
      const routeState = appExports.history.getRouteState();
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
