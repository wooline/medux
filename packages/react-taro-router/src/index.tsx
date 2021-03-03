/* eslint-disable import/order */
import Taro from '@tarojs/taro';
import {renderApp, setConfig as setCoreConfig, exportModule as baseExportModule} from '@medux/core';
import {routeMiddleware, routeReducer, setRouteConfig, nativeUrlToNativeLocation} from '@medux/route-web';
import {createRouter} from '@medux/route-mp';
import {setLoadViewOptions} from './loadView';
import {appExports} from './sington';

import type {ComponentType} from 'react';
import type {ModuleGetter, StoreOptions, ExportModule, ModuleStore} from '@medux/core';
import type {LocationTransform} from '@medux/route-web';
import type {RouteENV} from '@medux/route-mp';

export type {RootModuleFacade, Dispatch} from '@medux/core';
export type {Store} from 'redux';
export type {RouteModuleState as BaseModuleState, RootState, RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial} from '@medux/route-web';
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
export {RouteModuleHandlers as BaseModuleHandlers, createLocationTransform} from '@medux/route-web';
export {exportApp, patchActions} from './sington';
export {Else} from './components/Else';
export {Switch} from './components/Switch';

declare const process: any;
declare const wx: any;
declare const require: any;

const routeENV: RouteENV = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  getCurrentPages: Taro.getCurrentPages,
  getLocation: () => {
    const arr = Taro.getCurrentPages();
    let path: string;
    let query;
    if (arr.length === 0) {
      ({path, query} = Taro.getLaunchOptionsSync());
    } else {
      const current = arr[arr.length - 1];
      path = current.route;
      query = current.options;
    }
    return {
      pathname: path.startsWith('/') ? path : `/${path}`,
      searchData: query && Object.keys(query).length ? query : undefined,
    };
  },
  onRouteChange() {
    return () => undefined;
  },
};
let fixOnRouteChangeOnce: boolean = false; // 小程序中初始化即会触发一次onRouteChange，需要忽略
if (process.env.TARO_ENV === 'weapp') {
  routeENV.onRouteChange = (callback) => {
    wx.onAppRoute(({openType, path, query}: {openType: string; path: string; query: {[key: string]: string}}) => {
      if (!fixOnRouteChangeOnce) {
        fixOnRouteChangeOnce = true;
        return;
      }
      const actionMap = {
        switchTab: 'RELAUNCH',
        reLaunch: 'RELAUNCH',
        redirectTo: 'REPLACE',
        navigateTo: 'PUSH',
        navigateBack: 'POP',
      };
      const searchData = Object.keys(query).reduce((params: any, key) => {
        if (!params) {
          params = {};
        }
        params[key] = decodeURIComponent(params[key]);
        return params;
      }, undefined);

      callback(path.startsWith('/') ? path : `/${path}`, searchData, actionMap[openType]);
    });
    return () => undefined;
  };
} else if (process.env.TARO_ENV === 'h5') {
  const taroRouter: {
    history: {location: {pathname: string; search: string}; listen: (callback: (location: {pathname: string; search: string}, action: string) => void) => () => void};
  } = require('@tarojs/router');
  routeENV.getLocation = () => {
    const {pathname, search} = taroRouter.history.location;
    const nativeLocation = nativeUrlToNativeLocation(pathname + search);
    return {pathname: nativeLocation.pathname, searchData: nativeLocation.searchData};
  };
  routeENV.onRouteChange = (callback) => {
    const unhandle = taroRouter.history.listen((location, action) => {
      const nativeLocation = nativeUrlToNativeLocation([location.pathname, location.search].join(''));
      const actionMap = {
        POP: 'POP',
        PUSH: 'PUSH',
        REPLACE: 'PUSH',
      };
      callback(nativeLocation.pathname, nativeLocation.searchData, actionMap[action]);
    });
    return unhandle;
  };
}

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
  const router = createRouter(locationTransform, routeENV);
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
