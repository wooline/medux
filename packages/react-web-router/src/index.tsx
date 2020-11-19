/// <reference path="../env/global.d.ts" />
import {routeMiddleware, routeReducer} from '@medux/route-plan-a';
import {RootActions, ModuleGetter, StoreOptions, exportActions} from '@medux/core';
import React, {ReactElement, ComponentType, FunctionComponent, ComponentClass} from 'react';
import {renderApp, renderSSR, loadView, LoadView} from '@medux/react';
import {createRouter, HistoryActions} from '@medux/web';
import {connect as baseConnect, Options as ReactReduxOptions} from 'react-redux';
import type {Dispatch, Store} from 'redux';
import type {LocationMap, RouteRule, RootState, RootRouteParams} from '@medux/route-plan-a';

export {exportModule} from '@medux/react';
export {ActionTypes, delayPromise, LoadingState, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime} from '@medux/core';
export {setRouteConfig, RouteModuleHandlers as BaseModuleHandlers} from '@medux/route-plan-a';

export type {Dispatch, Store} from 'redux';
export type {RouteRule, RouteState, LocationMap, RouteModuleState as BaseModuleState} from '@medux/route-plan-a';
export type {HistoryActions} from '@medux/web';

export type AppExports<MG extends ModuleGetter> = {
  store: Store;
  state: RootState<MG>;
  actions: RootActions<MG>;
  loadView: LoadView<MG>;
  history: HistoryActions<RootRouteParams<MG>>;
};
const appExports: AppExports<{}> = {loadView} as any;

export function exportApp(): any {
  return appExports;
}

export function buildApp(
  moduleGetter: ModuleGetter,
  {
    appModuleName = 'app',
    appViewName = 'main',
    historyType = 'Browser',
    routeRule = {},
    locationMap,
    defaultRouteParams = {},
    storeOptions = {},
    container = 'root',
  }: {
    appModuleName?: string;
    appViewName?: string;
    historyType?: 'Browser' | 'Hash' | 'Memory';
    routeRule?: RouteRule;
    locationMap?: LocationMap;
    defaultRouteParams?: {[moduleName: string]: any};
    storeOptions?: StoreOptions;
    container?: string | Element | ((component: ReactElement<any>) => void);
  }
) {
  appExports.history = createRouter(historyType, defaultRouteParams, routeRule, locationMap);
  appExports.actions = exportActions(moduleGetter);
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
  storeOptions.initData = appExports.history.mergeInitState(storeOptions.initData as any);

  return renderApp(moduleGetter, appModuleName, appViewName, storeOptions, container, (store) => {
    appExports.store = store as any;
    Object.defineProperty(appExports, 'state', {
      get: () => {
        return store.getState();
      },
    });
    appExports.history.setStore(store);
    return appExports.history.getModulePath();
  });
}

export function buildSSR(
  moduleGetter: ModuleGetter,
  {
    appModuleName = 'app',
    appViewName = 'main',
    location,
    routeRule = {},
    locationMap,
    defaultRouteParams = {},
    storeOptions = {},
    renderToStream = false,
  }: {
    appModuleName?: string;
    appViewName?: string;
    location: string;
    routeRule?: RouteRule;
    locationMap?: LocationMap;
    defaultRouteParams?: {[moduleName: string]: any};
    storeOptions?: StoreOptions;
    renderToStream?: boolean;
  }
): Promise<{html: string | meduxCore.ReadableStream; data: any; ssrInitStoreKey: string}> {
  appExports.history = createRouter(location, defaultRouteParams, routeRule, locationMap);
  appExports.actions = exportActions(moduleGetter);
  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }
  storeOptions.initData = appExports.history.mergeInitState(storeOptions.initData as any);
  return renderSSR(moduleGetter, appModuleName, appViewName, storeOptions, renderToStream, (store) => {
    appExports.store = store as any;
    Object.defineProperty(appExports, 'state', {
      get: () => {
        return store.getState();
      },
    });
    appExports.history.setStore(store);
    return appExports.history.getModulePath();
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

export type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;

export type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;

export interface Connect {
  // eslint-disable-next-line @typescript-eslint/ban-types
  <S = {}, D = {}, W = {}>(
    mapStateToProps?: (state: any, owner: W) => S,
    mapDispatchToProps?: (dispatch: Dispatch, owner: W) => D,
    options?: ReactReduxOptions<any, S, W>
  ): InferableComponentEnhancerWithProps<S & D & {dispatch: Dispatch}>;
}
export const connect: Connect = baseConnect as any;
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
        replace ? appExports.history.replace(rest.href!) : appExports.history.push(rest.href!);
      }
    },
  };
  return <a {...props} ref={ref} />;
});
