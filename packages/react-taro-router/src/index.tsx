/* eslint-disable import/order */

import React from 'react';
import Taro from '@tarojs/taro';
import {env, renderApp, renderSSR, mergeState, setConfig as setCoreConfig, exportModule as baseExportModule} from '@medux/core';
import {routeMiddleware, routeReducer, setRouteConfig} from '@medux/route-web';
import {createRouter} from '@medux/route-mp';
import {setLoadViewOptions} from './loadView';

import type {ComponentType, ReactElement} from 'react';
import type {ModuleGetter, StoreOptions, ExportModule} from '@medux/core';
import type {RouteENV} from '@medux/route-mp';

const routeENV: RouteENV = {reLaunch: Taro.reLaunch, redirectTo: Taro.redirectTo, navigateTo: Taro.navigateTo, navigateBack: Taro.navigateBack};

export function setConfig(conf: {
  RSP?: string;
  actionMaxHistory?: number;
  pagesMaxHistory?: number;
  pagenames?: {[key: string]: string};
  NSP?: string;
  MSP?: string;
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
  const router = createRouter(locationTransform, routeENV);
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
