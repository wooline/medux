/// <reference path="../env/global.d.ts" />
import React, { ReactElement, ComponentType, FunctionComponent, ComponentClass } from 'react';
import { LoadView } from '@medux/react';
import { HistoryActions } from '@medux/web';
import { Options as ReactReduxOptions } from 'react-redux';
import type { RootModuleFacade, RootModuleAPI, ModuleGetter, StoreOptions, Dispatch } from '@medux/core';
import type { Store } from 'redux';
import type { RootState, LocationTransform } from '@medux/route-plan-a';
export { exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime } from '@medux/core';
export { setRouteConfig, RouteModuleHandlers as BaseModuleHandlers, createLocationTransform } from '@medux/route-plan-a';
export type { RootModuleFacade, Dispatch } from '@medux/core';
export type { Store } from 'redux';
export type { RouteState, RootState, RouteModuleState as BaseModuleState, LocationMap, LocationTransform, HistoryAction, NativeLocation, Location, Params } from '@medux/route-plan-a';
export type { HistoryActions } from '@medux/web';
export declare type FacadeExports<APP extends RootModuleFacade, RouteParams extends {
    [K in keyof APP]: any;
}> = {
    App: {
        store: Store;
        state: RootState<APP, Partial<RouteParams>>;
        loadView: LoadView<APP>;
        history: HistoryActions<Partial<RouteParams>>;
        getActions<N extends keyof APP>(...args: N[]): {
            [K in N]: APP[K]['actions'];
        };
    };
    Modules: RootModuleAPI<APP>;
};
export declare function exportApp(): FacadeExports<any, any>;
export declare function buildApp(moduleGetter: ModuleGetter, { appModuleName, appViewName, historyType, locationTransform, storeOptions, container, }: {
    appModuleName?: string;
    appViewName?: string;
    historyType?: 'Browser' | 'Hash' | 'Memory';
    locationTransform?: LocationTransform;
    storeOptions?: StoreOptions;
    container?: string | Element | ((component: ReactElement<any>) => void);
}): Promise<{
    store: import("@medux/core/types").ModuleStore;
}>;
export declare function buildSSR(moduleGetter: ModuleGetter, { appModuleName, appViewName, location, locationTransform, storeOptions, renderToStream, }: {
    appModuleName?: string;
    appViewName?: string;
    location: string;
    locationTransform?: LocationTransform;
    storeOptions?: StoreOptions;
    renderToStream?: boolean;
}): Promise<{
    html: string | meduxCore.ReadableStream;
    data: any;
    ssrInitStoreKey: string;
}>;
interface ElseProps {
    elseView?: React.ReactNode;
    children: React.ReactNode;
}
export declare const Else: React.FC<ElseProps>;
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
