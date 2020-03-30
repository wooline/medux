import { TransformRoute, MeduxLocation } from '@medux/route-plan-a';
import { RootState as BaseRootState, ModuleGetter, StoreOptions } from '@medux/core';
import { History } from 'history';
import React, { ReactElement } from 'react';
import { HistoryActions, ToBrowserUrl } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
export type { Actions, RouteData, BaseModelState } from '@medux/core';
export type { LoadView } from '@medux/react';
export type { RouteConfig } from '@medux/route-plan-a';
export declare function getBrowserRouter<Params>(): {
    transformRoute: TransformRoute;
    historyActions: HistoryActions<Params>;
    toUrl: ToBrowserUrl<Params>;
};
export declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, history: History, routeConfig: import('@medux/route-plan-a').RouteConfig, storeOptions?: StoreOptions, container?: string | Element | ((component: ReactElement<any>) => void)): Promise<import("redux").Store<any, import("redux").AnyAction>>;
export declare function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(moduleGetter: M, appModuleName: A, location: string, routeConfig: import('@medux/route-plan-a').RouteConfig, storeOptions?: StoreOptions, renderToStream?: boolean): Promise<{
    html: string | ReadableStream;
    data: any;
    ssrInitStoreKey: string;
}>;
export declare type RootState<G extends ModuleGetter> = BaseRootState<G, MeduxLocation>;
interface SwitchProps {
    elseView?: React.ReactNode;
    children: React.ReactNode;
}
export declare const Switch: React.FC<SwitchProps>;
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    replace?: boolean;
}
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
