/// <reference path="../env/global.d.ts" />
import {routeMiddleware, routeReducer} from '@medux/route-plan-a';
import {getRootModuleAPI} from '@medux/core';
import React, {ReactElement, ComponentType, FunctionComponent, ComponentClass} from 'react';
import {renderApp, renderSSR, loadView, LoadView} from '@medux/react';
import {createRouter, HistoryActions} from '@medux/web';
import {connect as baseConnect, Options as ReactReduxOptions} from 'react-redux';

import type {RootModuleFacade, RootModuleAPI, ModuleGetter, StoreOptions, Dispatch} from '@medux/core';
import type {Store} from 'redux';
import type {RootState, LocationTransform} from '@medux/web';

export {exportModule} from '@medux/react';
export {ActionTypes, delayPromise, LoadingState, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime} from '@medux/core';
export {setRouteConfig, deepExtend, RouteModuleHandlers as BaseModuleHandlers, createWebLocationTransform} from '@medux/route-plan-a';

export type {RootModuleFacade, Dispatch} from '@medux/core';
export type {Store} from 'redux';
export type {RouteModuleState as BaseModuleState, LocationMap, HistoryAction, Location, PathnameRules} from '@medux/route-plan-a';
export type {RootState, RouteState, LocationTransform} from '@medux/web';

export type FacadeExports<APP extends RootModuleFacade, RouteParams extends {[K in keyof APP]: any}> = {
  App: {
    store: Store;
    state: RootState<APP, RouteParams>;
    loadView: LoadView<APP>;
    history: HistoryActions<RouteParams>;
    getActions<N extends keyof APP>(...args: N[]): {[K in N]: APP[K]['actions']};
  };
  Modules: RootModuleAPI<APP>;
};
const appExports: {store: any; state: any; loadView: any; getActions: any; history: any} = {
  loadView,
  getActions: undefined,
  state: undefined,
  store: undefined,
  history: undefined,
};

export function exportApp(): FacadeExports<any, any> {
  const modules = getRootModuleAPI();
  appExports.getActions = (...args: string[]) => {
    return args.reduce((prev, moduleName) => {
      prev[moduleName] = modules[moduleName].actions;
      return prev;
    }, {});
  };
  return {
    App: appExports as any,
    Modules: modules,
  };
}

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
    container?: string | Element | ((component: ReactElement<any>) => void);
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
  storeOptions.initData = {...storeOptions.initData, route: appExports.history.getRouteState()};
  // storeOptions.initData = appExports.history.mergeInitState(storeOptions.initData as any);

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
    locationTransform,
    storeOptions = {},
    renderToStream = false,
  }: {
    appModuleName?: string;
    appViewName?: string;
    location: string;
    locationTransform: LocationTransform<any>;
    storeOptions?: StoreOptions;
    renderToStream?: boolean;
  }
): Promise<{html: string | meduxCore.ReadableStream; data: any; ssrInitStoreKey: string}> {
  appExports.history = createRouter(location, locationTransform);
  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }
  storeOptions.initData = {...storeOptions.initData, route: appExports.history.getRouteState()};
  // storeOptions.initData = appExports.history.mergeInitState(storeOptions.initData as any);
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

interface ElseProps {
  elseView?: React.ReactNode;
  children: React.ReactNode;
}
export const Else: React.FC<ElseProps> = ({children, elseView}) => {
  if (!children || (Array.isArray(children) && children.every((item) => !item))) {
    return <>{elseView}</>;
  }
  return <>{children}</>;
};

interface SwitchProps {
  elseView?: React.ReactNode;
  children: React.ReactNode;
}
export const Switch: React.FC<SwitchProps> = ({children, elseView}) => {
  if (!children || (Array.isArray(children) && children.every((item) => !item))) {
    return <>{elseView}</>;
  }
  return <>{Array.isArray(children) ? children[0] : children}</>;
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
