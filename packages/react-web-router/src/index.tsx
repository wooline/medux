/// <reference path="../env/global.d.ts" />
import {TransformRoute as PTransformRoute, MeduxLocation, RouteConfig as PRouteConfig, setRouteConfig} from '@medux/route-plan-a';
import {RootState as BaseRootState, RouteState, ModuleGetter, StoreOptions, StoreState, ActionTypes, DisplayViews} from '@medux/core';
import {Store, Middleware} from 'redux';
import React, {ReactElement} from 'react';
import {renderApp, renderSSR} from '@medux/react';
import {History, HistoryActions as PHistoryActions, LocationMap as PLocationMap, createRouter} from '@medux/web';

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

let historyActions: PHistoryActions | undefined = undefined;
let transformRoute: PTransformRoute | undefined = undefined;

function checkRedirect(views: DisplayViews, throwError?: boolean): boolean {
  if (views['@']) {
    const url = Object.keys(views['@'])[0];
    if (throwError) {
      throw {code: '301', message: url, detail: url};
    } else {
      historyActions!.replace(url);
    }
    return true;
  }
  return false;
}
const redirectMiddleware: Middleware = () => (next) => (action) => {
  if (action.type === ActionTypes.RouteChange) {
    const routeState: RouteState = action.payload[0];
    const {views} = routeState.data;
    if (checkRedirect(views)) {
      return;
    }
  }
  return next(action);
};

export function buildApp({
  moduleGetter,
  appModuleName = 'app',
  appViewName = 'main',
  history,
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
  history: History;
  routeConfig?: PRouteConfig;
  locationMap?: PLocationMap;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
  container?: string | Element | ((component: ReactElement<any>) => void);
  beforeRender?: (data: {store: Store<StoreState>; history: History; historyActions: PHistoryActions; transformRoute: PTransformRoute}) => Store<StoreState>;
}) {
  setRouteConfig({defaultRouteParams});
  const router = createRouter(history, routeConfig, locationMap);
  historyActions = router.historyActions;
  transformRoute = router.transformRoute;
  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }
  storeOptions.middlewares.unshift(redirectMiddleware);
  return renderApp(moduleGetter, appModuleName, appViewName, historyActions, storeOptions, container, (store) => {
    const storeState = store.getState();
    const {views} = storeState.route.data;
    checkRedirect(views);
    return beforeRender ? beforeRender({store, history, historyActions: historyActions!, transformRoute: transformRoute!}) : store;
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
  routeConfig?: PRouteConfig;
  locationMap?: PLocationMap;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
  renderToStream?: boolean;
  beforeRender?: (data: {store: Store<StoreState>; history: History; historyActions: PHistoryActions; transformRoute: PTransformRoute}) => Store<StoreState>;
}): Promise<{html: string | meduxCore.ReadableStream; data: any; ssrInitStoreKey: string}> {
  setRouteConfig({defaultRouteParams});
  const [pathname, search = ''] = location.split('?');
  const history: History = {
    listen: () => void 0,
    location: {
      pathname,
      search: search && '?' + search,
      hash: '',
    },
  } as any;
  const router = createRouter(history, routeConfig, locationMap);
  historyActions = router.historyActions;
  transformRoute = router.transformRoute;
  return renderSSR(moduleGetter, appModuleName, appViewName, historyActions, storeOptions, renderToStream, (store) => {
    const storeState = store.getState();
    const {views} = storeState.route.data;
    checkRedirect(views, true);
    return beforeRender ? beforeRender({store, history, historyActions: historyActions!, transformRoute: transformRoute!}) : store;
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
  } else {
    return <>{children}</>;
  }
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  replace?: boolean;
}

function isModifiedEvent(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

// eslint-disable-next-line react/display-name
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
