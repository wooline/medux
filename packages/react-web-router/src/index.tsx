/// <reference path="../env/global.d.ts" />
import {routeMiddleware, routeReducer} from '@medux/route-plan-a';
import {getRootModuleAPI} from '@medux/core';
import React, {ReactElement, ComponentType, FunctionComponent, ComponentClass} from 'react';
import {renderApp, renderSSR, loadView, LoadView} from '@medux/react';
import {createRouter, HistoryActions} from '@medux/web';
import {connect as baseConnect, Options as ReactReduxOptions} from 'react-redux';

import type {RootModuleFacade, RootModuleAPI, ModuleGetter, StoreOptions} from '@medux/core';
import type {Dispatch, Store} from 'redux';
import type {LocationMap, RouteRule, RootState} from '@medux/route-plan-a';

export {exportModule} from '@medux/react';
export {ActionTypes, delayPromise, LoadingState, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime} from '@medux/core';
export {setRouteConfig, RouteModuleHandlers as BaseModuleHandlers} from '@medux/route-plan-a';

export type {RootModuleFacade} from '@medux/core';
export type {Dispatch, Store} from 'redux';
export type {RouteRule, RouteState, RootState, LocationMap, RouteModuleState as BaseModuleState} from '@medux/route-plan-a';
export type {HistoryActions} from '@medux/web';

export type FacadeExports<APP extends RootModuleFacade> = {
  App: {
    store: Store;
    state: RootState<APP>;
    loadView: LoadView<APP>;
    history: HistoryActions<RootState<APP>['route']['params']>;
  };
  Modules: RootModuleAPI<APP>;
};
const appExports: {store: any; state: any; loadView: any; history: any} = {loadView, state: undefined, store: undefined, history: undefined};

export function exportApp(): FacadeExports<any> {
  return {
    App: appExports as any,
    Modules: getRootModuleAPI(),
  };
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
    appExports.history.setStore(store);
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
