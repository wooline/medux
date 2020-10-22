/// <reference path="../env/global.d.ts" />
import {MeduxLocation, setRouteConfig} from '@medux/route-plan-a';
import {RootState as BaseRootState, RouteState, ModuleGetter, StoreOptions, StoreState, ActionTypes, isServer} from '@medux/core';
import {Store, Middleware} from 'redux';
import React, {ReactElement} from 'react';
import {renderApp, renderSSR} from '@medux/react';
import {createRouter} from '@medux/web';
import type {TransformRoute, RouteConfig} from '@medux/route-plan-a';
import type {HistoryActions, LocationMap} from '@medux/web';

export {loadView, exportModule} from '@medux/react';
export {
  ActionTypes,
  delayPromise,
  LoadingState,
  exportActions,
  BaseModelHandlers,
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
export {setRouteConfig} from '@medux/route-plan-a';

export type {Actions, RouteData, RouteViews, BaseModelState} from '@medux/core';
export type {LoadView} from '@medux/react';
export type {RouteConfig, TransformRoute} from '@medux/route-plan-a';
export type {LocationMap, HistoryActions} from '@medux/web';

let historyActions: HistoryActions | undefined;
let transformRoute: TransformRoute | undefined;

const redirectMiddleware: Middleware = () => (next) => (action) => {
  if (action.type === ActionTypes.RouteChange) {
    const routeState: RouteState = action.payload[0];
    const {views} = routeState.data;
    if (views['@']) {
      const url = Object.keys(views['@'])[0];
      if (isServer()) {
        throw {code: '301', message: url, detail: url};
      } else {
        historyActions!.replace(url);
      }
      return;
    }
  }
  // eslint-disable-next-line consistent-return
  return next(action);
};

export function buildApp({
  moduleGetter,
  appModuleName = 'app',
  appViewName = 'main',
  historyType = 'Browser',
  routeConfig = {},
  locationMap,
  defaultRouteParams,
  storeOptions = {},
  container = 'root',
  beforeRender,
}: {
  moduleGetter: ModuleGetter;
  appModuleName?: string;
  appViewName?: string;
  historyType?: 'Browser' | 'Hash' | 'Memory';
  routeConfig?: RouteConfig;
  locationMap?: LocationMap;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
  container?: string | Element | ((component: ReactElement<any>) => void);
  beforeRender?: (data: {store: Store<StoreState>; historyActions: HistoryActions; transformRoute: TransformRoute}) => Store<StoreState>;
}) {
  setRouteConfig({defaultRouteParams});
  const router = createRouter(historyType, routeConfig, locationMap);
  historyActions = router.historyActions;
  transformRoute = router.transformRoute;
  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }
  storeOptions.middlewares.unshift(redirectMiddleware);
  return renderApp(moduleGetter, appModuleName, appViewName, historyActions, storeOptions, container, (store) => {
    return beforeRender ? beforeRender({store, historyActions: historyActions!, transformRoute: transformRoute!}) : store;
  });
}

export function buildSSR({
  moduleGetter,
  appModuleName = 'app',
  appViewName = 'main',
  location,
  routeConfig = {},
  locationMap,
  defaultRouteParams,
  storeOptions = {},
  renderToStream = false,
  beforeRender,
}: {
  moduleGetter: ModuleGetter;
  appModuleName?: string;
  appViewName?: string;
  location: string;
  routeConfig?: RouteConfig;
  locationMap?: LocationMap;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
  renderToStream?: boolean;
  beforeRender?: (data: {store: Store<StoreState>; historyActions: HistoryActions; transformRoute: TransformRoute}) => Store<StoreState>;
}): Promise<{html: string | meduxCore.ReadableStream; data: any; ssrInitStoreKey: string}> {
  setRouteConfig({defaultRouteParams});
  const router = createRouter(location, routeConfig, locationMap);
  historyActions = router.historyActions;
  transformRoute = router.transformRoute;
  return renderSSR(moduleGetter, appModuleName, appViewName, historyActions, storeOptions, renderToStream, (store) => {
    return beforeRender ? beforeRender({store, historyActions: historyActions!, transformRoute: transformRoute!}) : store;
  });
}

export type RootState<G extends ModuleGetter> = BaseRootState<G, MeduxLocation>;

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
