/* eslint-disable import/order */
/// <reference path="../env/global.d.ts" />
import {renderApp, setConfig as setCoreConfig, exportModule as baseExportModule, env} from '@medux/core';
import {routeMiddleware, routeReducer, setRouteConfig} from '@medux/route-web';
import {createRouter} from '@medux/route-mp';
import {routeENV, tabPages} from './patch';
import {setLoadViewOptions} from './loadView';
import {appExports} from './sington';

import type {ComponentType} from 'react';
import type {ModuleGetter, StoreOptions, ExportModule, ModuleStore} from '@medux/core';
import type {LocationTransform} from '@medux/route-web';

export type {RootModuleFacade, Dispatch} from '@medux/core';
export type {Store} from 'redux';
export type {
  RouteModuleState as BaseModuleState,
  RootState,
  RouteState,
  PayloadLocation,
  LocationTransform,
  NativeLocation,
  PagenameMap,
  HistoryAction,
  Location,
  DeepPartial,
} from '@medux/route-web';
export type {LoadView} from './loadView';
export type {FacadeExports} from './sington';

export {
  ActionTypes,
  delayPromise,
  LoadingState,
  env,
  effect,
  errorAction,
  reducer,
  setLoading,
  logger,
  setLoadingDepthTime,
  deepMerge,
  deepMergeState,
  isProcessedError,
  setProcessedError,
} from '@medux/core';
export {RouteModuleHandlers as BaseModuleHandlers, createLocationTransform, RouteActionTypes} from '@medux/route-web';
export {eventBus} from './patch';
export {exportApp, patchActions} from './sington';
export {Else} from './components/Else';
export {Switch} from './components/Switch';

export function setConfig(conf: {
  RSP?: string;
  actionMaxHistory?: number;
  pagesMaxHistory?: number;
  pagenames?: {[key: string]: string};
  NSP?: string;
  MSP?: string;
  MutableData?: boolean;
  DEVTOOLS?: boolean;
  LoadViewOnError?: ComponentType<{message: string}>;
  LoadViewOnLoading?: ComponentType<{}>;
  disableNativeRoute?: boolean;
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
    locationTransform,
    storeOptions = {},
  }: {
    appModuleName?: string;
    appViewName?: string;
    locationTransform: LocationTransform<any>;
    storeOptions?: StoreOptions;
  },
  startup: (store: ModuleStore) => void
) {
  env.__taroAppConfig.tabBar.list.reduce((obj, {pagePath}) => {
    obj[`/${pagePath.replace(/^\/+|\/+$/g, '')}`] = true;
    return obj;
  }, tabPages);
  const router = createRouter(locationTransform, routeENV, tabPages);
  appExports.router = router;
  const {middlewares = [], reducers = {}, initData = {}} = storeOptions;
  middlewares.unshift(routeMiddleware);
  reducers.route = routeReducer;
  initData.route = router.getRouteState();

  return renderApp<ComponentType<any>>(
    () => {
      return () => undefined;
    },
    moduleGetter,
    appModuleName,
    appViewName,
    {...storeOptions, middlewares, reducers, initData},
    (store) => {
      router.setStore(store);
      appExports.store = store as any;
      Object.defineProperty(appExports, 'state', {
        get: () => {
          return store.getState();
        },
      });
      startup(store);
    },
    []
  );
}
