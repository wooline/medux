/// <reference path="../env/global.d.ts" />
import {routeMiddleware, routeReducer} from '@medux/route-plan-a';
import {ModuleGetter, StoreOptions} from '@medux/core';
import {Store} from 'redux';
import React, {ReactElement} from 'react';
import {renderApp, renderSSR} from '@medux/react';
import {createRouter, HistoryActions} from '@medux/web';
import type {LocationMap, RouteRule} from '@medux/route-plan-a';

export {loadView, exportModule} from '@medux/react';
export {
  ActionTypes,
  delayPromise,
  LoadingState,
  exportActions,
  modelHotReplacement,
  effect,
  errorAction,
  reducer,
  viewHotReplacement,
  setLoading,
  setConfig,
  logger,
  setLoadingDepthTime,
} from '@medux/core';
export {setRouteConfig, RouteModelHandlers as BaseModelHandlers} from '@medux/route-plan-a';

export type {Actions} from '@medux/core';
export type {LoadView} from '@medux/react';
export type {RootState, RouteRule, LocationMap} from '@medux/route-plan-a';
export type {HistoryActions} from '@medux/web';

let historyActions: HistoryActions | undefined;

export function buildApp({
  moduleGetter,
  appModuleName = 'app',
  appViewName = 'main',
  historyType = 'Browser',
  routeRule = {},
  locationMap,
  defaultRouteParams = {},
  storeOptions = {},
  container = 'root',
  beforeRender,
}: {
  moduleGetter: ModuleGetter;
  appModuleName?: string;
  appViewName?: string;
  historyType?: 'Browser' | 'Hash' | 'Memory';
  routeRule?: RouteRule;
  locationMap?: LocationMap;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
  container?: string | Element | ((component: ReactElement<any>) => void);
  beforeRender?: (data: {store: Store; historyActions: HistoryActions}) => Store;
}) {
  historyActions = createRouter(historyType, defaultRouteParams, routeRule, locationMap);
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
  storeOptions.initData = historyActions.mergeInitState(storeOptions.initData);
  return renderApp(moduleGetter, appModuleName, appViewName, storeOptions, container, (store) => {
    const newStore = beforeRender ? beforeRender({store, historyActions: historyActions!}) : store;
    historyActions?.setStore(newStore);
    return newStore;
  });
}

export function buildSSR({
  moduleGetter,
  appModuleName = 'app',
  appViewName = 'main',
  location,
  routeRule = {},
  locationMap,
  defaultRouteParams = {},
  storeOptions = {},
  renderToStream = false,
  beforeRender,
}: {
  moduleGetter: ModuleGetter;
  appModuleName?: string;
  appViewName?: string;
  location: string;
  routeRule?: RouteRule;
  locationMap?: LocationMap;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
  renderToStream?: boolean;
  beforeRender?: (data: {store: Store; historyActions: HistoryActions}) => Store;
}): Promise<{html: string | meduxCore.ReadableStream; data: any; ssrInitStoreKey: string}> {
  historyActions = createRouter(location, defaultRouteParams, routeRule, locationMap);
  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }
  storeOptions.initData = historyActions.mergeInitState(storeOptions.initData);
  return renderSSR(moduleGetter, appModuleName, appViewName, storeOptions, renderToStream, (store) => {
    const newStore = beforeRender ? beforeRender({store, historyActions: historyActions!}) : store;
    historyActions?.setStore(newStore);
    return newStore;
  });
}

interface SwitchProps {
  elseView?: React.ReactNode;
  children: React.ReactNode;
}
export const Switch: React.FC<SwitchProps> = ({children, elseView}) => {
  if (!children || (Array.isArray(children) && children.every((item) => !item))) {
    return <>{elseView}</>;
  }
  return <>{children}</>;
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  replace?: boolean;
}

function isModifiedEvent(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({onClick, replace, ...rest}, ref) => {
  const {target} = rest;
  const props = {
    ...rest,
    onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      try {
        onClick && onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (
        !event.defaultPrevented && // onClick prevented default
        event.button === 0 && // ignore everything but left clicks
        (!target || target === '_self') && // let browser handle "target=_blank" etc.
        !isModifiedEvent(event) // ignore clicks with modifier keys
      ) {
        event.preventDefault();
        replace ? historyActions!.replace(rest.href!) : historyActions!.push(rest.href!);
      }
    },
  };
  return <a {...props} ref={ref} />;
});
