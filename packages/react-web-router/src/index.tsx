import {TransformRoute, MeduxLocation, setRouteConfig} from '@medux/route-plan-a';
import {RootState as BaseRootState, ModuleGetter, StoreOptions, StoreState} from '@medux/core';
import {History, createLocation} from 'history';
import {Store} from 'redux';
import React, {ReactElement} from 'react';
import {renderApp, renderSSR} from '@medux/react';
import {HistoryActions, createRouter, ToBrowserUrl} from '@medux/web';

export {loadView, exportModule} from '@medux/react';
export {ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer} from '@medux/core';
export {setRouteConfig} from '@medux/route-plan-a';

export type {Actions, RouteData, RouteViews, BaseModelState} from '@medux/core';
export type {LoadView} from '@medux/react';
export type {RouteConfig} from '@medux/route-plan-a';

let historyActions: HistoryActions | undefined = undefined;
let transformRoute: TransformRoute | undefined = undefined;
let toBrowserUrl: ToBrowserUrl | undefined = undefined;

export type BrowserRouter<Params> = {transformRoute: TransformRoute; historyActions: HistoryActions<Params>; toUrl: ToBrowserUrl<Params>};

export function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>({
  moduleGetter,
  appModuleName,
  history,
  routeConfig = {},
  defaultRouteParams,
  storeOptions = {},
  container = 'root',
  beforeRender,
}: {
  moduleGetter: M;
  appModuleName: A;
  history: History;
  routeConfig?: import('@medux/route-plan-a').RouteConfig;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
  container?: string | Element | ((component: ReactElement<any>) => void);
  beforeRender?: (data: {store: Store<StoreState>; history: History; historyActions: HistoryActions; toBrowserUrl: ToBrowserUrl; transformRoute: TransformRoute}) => Store<StoreState>;
}) {
  setRouteConfig({defaultRouteParams});
  const router = createRouter(history, routeConfig);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  return renderApp(moduleGetter, appModuleName, router.historyProxy, storeOptions, container, (store) => {
    const storeState = store.getState();
    const {views} = storeState.route.data;
    if (views['@']) {
      const url = Object.keys(views['@'])[0];
      historyActions!.replace(url);
    }
    return beforeRender ? beforeRender({store, history, historyActions: historyActions!, toBrowserUrl: toBrowserUrl!, transformRoute: transformRoute!}) : store;
  });
}

export function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>({
  moduleGetter,
  appModuleName,
  location,
  routeConfig = {},
  defaultRouteParams,
  storeOptions = {},
  renderToStream = false,
  beforeRender,
}: {
  moduleGetter: M;
  appModuleName: A;
  location: string;
  routeConfig?: import('@medux/route-plan-a').RouteConfig;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
  renderToStream?: boolean;
  beforeRender?: (data: {store: Store<StoreState>; history: History; historyActions: HistoryActions; toBrowserUrl: ToBrowserUrl; transformRoute: TransformRoute}) => Store<StoreState>;
}): Promise<{html: string | ReadableStream; data: any; ssrInitStoreKey: string}> {
  setRouteConfig({defaultRouteParams});
  const history: History = {listen: () => void 0, location: createLocation(location)} as any;
  const router = createRouter(history, routeConfig);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  return renderSSR(moduleGetter, appModuleName, router.historyProxy, storeOptions, renderToStream, (store) => {
    const storeState = store.getState();
    const {views} = storeState.route.data;
    if (views['@']) {
      const url = Object.keys(views['@'])[0];
      throw {code: '301', message: url, detail: url};
    }
    return beforeRender ? beforeRender({store, history, historyActions: historyActions!, toBrowserUrl: toBrowserUrl!, transformRoute: transformRoute!}) : store;
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
