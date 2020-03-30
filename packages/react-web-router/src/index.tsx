import {TransformRoute, MeduxLocation} from '@medux/route-plan-a';
import {RootState as BaseRootState, ModuleGetter, StoreOptions} from '@medux/core';
import {History, createLocation} from 'history';

import React, {ReactElement} from 'react';
import {renderApp, renderSSR} from '@medux/react';
import {HistoryActions, createRouter, ToBrowserUrl} from '@medux/web';

export {loadView, exportModule} from '@medux/react';
export {ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer} from '@medux/core';
export {setRouteConfig} from '@medux/route-plan-a';

export type {Actions, RouteData, BaseModelState} from '@medux/core';
export type {LoadView} from '@medux/react';
export type {RouteConfig} from '@medux/route-plan-a';

let historyActions: HistoryActions | undefined = undefined;
let transformRoute: TransformRoute | undefined = undefined;
let toBrowserUrl: ToBrowserUrl | undefined = undefined;

export function getBrowserRouter<Params>(): {transformRoute: TransformRoute; historyActions: HistoryActions<Params>; toUrl: ToBrowserUrl<Params>} {
  return {transformRoute: transformRoute!, historyActions: historyActions!, toUrl: toBrowserUrl!};
}

export function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appModuleName: A,
  history: History,
  routeConfig: import('@medux/route-plan-a').RouteConfig,
  storeOptions: StoreOptions = {},
  container: string | Element | ((component: ReactElement<any>) => void) = 'root'
) {
  const router = createRouter(history, routeConfig);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  return renderApp(moduleGetter, appModuleName, router.historyProxy, storeOptions, container);
}

export function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appModuleName: A,
  location: string,
  routeConfig: import('@medux/route-plan-a').RouteConfig,
  storeOptions: StoreOptions = {},
  renderToStream: boolean = false
): Promise<{html: string | ReadableStream; data: any; ssrInitStoreKey: string}> {
  const router = createRouter({listen: () => void 0, location: createLocation(location)} as any, routeConfig);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  return renderSSR(moduleGetter, appModuleName, router.historyProxy, storeOptions, renderToStream);
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
