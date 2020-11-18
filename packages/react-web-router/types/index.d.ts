/// <reference path="../env/global.d.ts" />
import { RootActions, ModuleGetter, StoreOptions } from '@medux/core';
import React, { ReactElement, ComponentType, FunctionComponent, ComponentClass } from 'react';
import { LoadView } from '@medux/react';
import { HistoryActions } from '@medux/web';
import { Options as ReactReduxOptions } from 'react-redux';
import type { Dispatch, Store } from 'redux';
import type { LocationMap, RouteRule, RootState, RootRouteParams } from '@medux/route-plan-a';
export { exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime } from '@medux/core';
export { setRouteConfig, RouteModuleHandlers as BaseModuleHandlers } from '@medux/route-plan-a';
export type { Dispatch, Store } from 'redux';
export type { RouteRule, RouteState, LocationMap, RouteModuleState as BaseModuleState } from '@medux/route-plan-a';
export type { HistoryActions } from '@medux/web';
export declare type AppExports<MG extends ModuleGetter> = {
    store: Store;
    state: RootState<MG>;
    actions: RootActions<MG>;
    loadView: LoadView<MG>;
    history: HistoryActions<RootRouteParams<MG>>;
};
export declare function exportApp(): any;
export declare function buildApp(moduleGetter: ModuleGetter, { appModuleName, appViewName, historyType, routeRule, locationMap, defaultRouteParams, storeOptions, container, }: {
    appModuleName?: string;
    appViewName?: string;
    historyType?: 'Browser' | 'Hash' | 'Memory';
    routeRule?: RouteRule;
    locationMap?: LocationMap;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
    storeOptions?: StoreOptions;
    container?: string | Element | ((component: ReactElement<any>) => void);
}): Promise<{
    store: import("@medux/core/types").ModuleStore;
}>;
export declare function buildSSR(moduleGetter: ModuleGetter, { appModuleName, appViewName, location, routeRule, locationMap, defaultRouteParams, storeOptions, renderToStream, }: {
    appModuleName?: string;
    appViewName?: string;
    location: string;
    routeRule?: RouteRule;
    locationMap?: LocationMap;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
    storeOptions?: StoreOptions;
    renderToStream?: boolean;
}): Promise<{
    html: string | meduxCore.ReadableStream;
    data: any;
    ssrInitStoreKey: string;
}>;
interface SwitchProps {
    elseView?: React.ReactNode;
    children: React.ReactNode;
}
export declare const Switch: React.FC<SwitchProps>;
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    replace?: boolean;
}
export declare type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;
export declare type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;
export interface Connect {
    <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, mapDispatchToProps?: (dispatch: Dispatch, owner: W) => D, options?: ReactReduxOptions<any, S, W>): InferableComponentEnhancerWithProps<S & D & {
        dispatch: Dispatch;
    }>;
}
export declare const connect: Connect;
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
