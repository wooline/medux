import * as plana from '@medux/route-plan-a';
import * as web from '@medux/web';
import {RootState as BaseRootState, ModuleGetter, StoreOptions} from '@medux/core';
import {History, createLocation} from 'history';
import {buildToBrowserUrl, buildTransformRoute, getBrowserRouteActions} from '@medux/route-plan-a';

import React, {ReactElement} from 'react';
import {renderApp, renderSSR} from '@medux/react';
import {createHistory} from '@medux/web';

export {loadView, exportModule} from '@medux/react';
export {ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer} from '@medux/core';
export {setRouteConfig} from '@medux/route-plan-a';

export type {MeduxLocation, TransformRoute} from '@medux/web';
export type {Actions, RouteData, BaseModelState} from '@medux/core';
export type {LoadView} from '@medux/react';
export type {BrowserRoutePayload, RouteConfig, ToBrowserUrl} from '@medux/route-plan-a';

let historyActions: web.HistoryActions | undefined = undefined;
let transformRoute: web.TransformRoute | undefined = undefined;

export function getBrowserHistory<Params>(): {historyActions: plana.BrowserHistoryActions<Params>; toUrl: plana.ToBrowserUrl<Params>} {
  return {historyActions: getBrowserRouteActions<Params>(() => historyActions!), toUrl: buildToBrowserUrl(() => transformRoute!)};
}

export function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appModuleName: A,
  history: History,
  routeConfig: plana.RouteConfig,
  storeOptions: StoreOptions = {},
  container: string | Element | ((component: ReactElement<any>) => void) = 'root'
) {
  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }
  const historyData = createHistory(history, transformRoute);
  const {historyProxy} = historyData;
  historyActions = historyData.historyActions;

  return renderApp(moduleGetter, appModuleName, historyProxy, storeOptions, container);
}

export function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appModuleName: A,
  location: string,
  routeConfig: plana.RouteConfig,
  storeOptions: StoreOptions = {},
  renderToStream: boolean = false
): Promise<{html: string | ReadableStream; data: any; ssrInitStoreKey: string}> {
  if (!transformRoute) {
    transformRoute = buildTransformRoute(routeConfig);
  }
  const historyData = createHistory({listen: () => void 0, location: createLocation(location)} as any, transformRoute);
  const {historyProxy} = historyData;
  historyActions = historyData.historyActions;

  return renderSSR(moduleGetter, appModuleName, historyProxy, storeOptions, renderToStream);
}

export type RootState<G extends ModuleGetter> = BaseRootState<G, web.MeduxLocation>;

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
