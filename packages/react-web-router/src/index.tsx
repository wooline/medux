/// <reference path="../env/global.d.ts" />
import {routeMiddleware, routeReducer} from '@medux/route-plan-a';
import {getRootModuleAPI, isServer, MEDUX_ENV} from '@medux/core';
import React, {ComponentType, FunctionComponent, ComponentClass, ReactNode, useEffect} from 'react';
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

export interface ServerRequest {
  url: string;
}
export interface ServerResponse {}

export type FacadeExports<
  APP extends RootModuleFacade,
  RouteParams extends {[K in keyof APP]: any},
  Request extends ServerRequest = ServerRequest,
  Response extends ServerResponse = ServerResponse
> = {
  App: {
    store: Store;
    state: RootState<APP, RouteParams>;
    loadView: LoadView<APP>;
    history: HistoryActions<RouteParams>;
    getActions<N extends keyof APP>(...args: N[]): {[K in N]: APP[K]['actions']};
    request: Request;
    response: Response;
  };
  Modules: RootModuleAPI<APP>;
};
const appExports: {store: any; state: any; loadView: any; getActions: any; history: HistoryActions; request: ServerRequest; response: ServerResponse} = {
  loadView,
  getActions: undefined,
  state: undefined,
  store: undefined,
  history: undefined as any,
  request: undefined as any,
  response: undefined as any,
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
    container?: string;
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
    const routeState = appExports.history.getRouteState();
    return Object.keys(routeState.params);
  });
}

// @ts-ignore
const SSRTPL: string = isServer() && MEDUX_ENV.ssrHTML ? Buffer.from(MEDUX_ENV.ssrHTML, 'base64').toString() : '';

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
  appExports.request = request;
  appExports.response = response;
  appExports.history = createRouter(request.url, locationTransform);
  if (!storeOptions.initData) {
    storeOptions.initData = {};
  }
  storeOptions.initData = {...storeOptions.initData, route: appExports.history.getRouteState()};
  // storeOptions.initData = appExports.history.mergeInitState(storeOptions.initData as any);
  return renderSSR(moduleGetter, appModuleName, appViewName, storeOptions, false, (store) => {
    appExports.store = store as any;
    Object.defineProperty(appExports, 'state', {
      get: () => {
        return store.getState();
      },
    });
    appExports.history.setStore(store);
    const routeState = appExports.history.getRouteState();
    return Object.keys(routeState.params);
  }).then(({html, data, ssrInitStoreKey}) => {
    const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${container}['"][^<>]*>`, 'm'));
    if (match) {
      const pageHead = html.split(/<head>|<\/head>/, 3);
      html = pageHead[0] + pageHead[2];
      return SSRTPL.replace('</head>', `${pageHead[1]}\r\n<script>window.${ssrInitStoreKey} = ${JSON.stringify(data)};</script>\r\n</head>`).replace(match[0], match[0] + html);
    }
    return html;
  });
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

interface ElseProps {
  elseView?: ReactNode;
  children: ReactNode;
}
const ElseComponent: React.FC<ElseProps> = ({children, elseView}) => {
  const arr: ReactNode[] = [];
  React.Children.forEach(children, (item) => {
    item && arr.push(item);
  });
  if (arr.length > 0) {
    return <>{arr}</>;
  }
  return <>{elseView}</>;
};
export const Else = React.memo(ElseComponent);
interface SwitchProps {
  elseView?: ReactNode;
  children: ReactNode;
}
const SwitchComponent: React.FC<SwitchProps> = ({children, elseView}) => {
  const arr: ReactNode[] = [];
  React.Children.forEach(children, (item) => {
    item && arr.push(item);
  });
  if (arr.length > 0) {
    return <>{arr[0]}</>;
  }
  return <>{elseView}</>;
};

export const Switch = React.memo(SwitchComponent);

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
        replace ? appExports.history.replace(rest.href!) : appExports.history.push(rest.href!);
      }
    },
  };
  return <a {...props} ref={ref} />;
});

interface DocumentHeadProps {
  children?: ReactNode;
}

const DocumentHeadComponent: React.FC<DocumentHeadProps> = ({children}) => {
  let title = '';
  React.Children.forEach(children, (child: any) => {
    if (child && child.type === 'title') {
      title = child.props.children;
    }
  });
  if (!isServer()) {
    useEffect(() => {
      if (title) {
        // @ts-ignore
        document.title = title;
      }
    }, [title]);
    return null;
  }
  return <head>{children}</head>;
};

export const DocumentHead = React.memo(DocumentHeadComponent);
