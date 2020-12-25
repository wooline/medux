/// <reference types="@medux/react-web-router/env/global" />
import React, { ComponentType, FunctionComponent, ComponentClass, ReactNode } from 'react';
import { LoadView } from '@medux/react';
import { HistoryActions } from '@medux/web';
import { Options as ReactReduxOptions } from 'react-redux';
import type { RootModuleFacade, RootModuleAPI, RootModuleActions, ModuleGetter, StoreOptions, Dispatch } from '@medux/core';
import type { Store } from 'redux';
import type { RootState, LocationTransform } from '@medux/web';
export { exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime, isServer, serverSide, } from '@medux/core';
export { setRouteConfig, deepExtend, RouteModuleHandlers as BaseModuleHandlers, createWebLocationTransform } from '@medux/route-plan-a';
export type { RootModuleFacade, Dispatch } from '@medux/core';
export type { Store } from 'redux';
export type { RouteModuleState as BaseModuleState, LocationMap, HistoryAction, Location, PathnameRules } from '@medux/route-plan-a';
export type { RootState, RouteState, LocationTransform } from '@medux/web';
export interface ServerRequest {
    url: string;
}
export interface ServerResponse {
    redirect(status: number, path: string): void;
}
export declare type FacadeExports<APP extends RootModuleFacade, RouteParams extends {
    [K in keyof APP]: any;
}, Request extends ServerRequest = ServerRequest, Response extends ServerResponse = ServerResponse> = {
    App: {
        store: Store;
        state: RootState<APP, RouteParams>;
        loadView: LoadView<APP>;
        history: HistoryActions<RouteParams>;
        getActions<N extends keyof APP>(...args: N[]): {
            [K in N]: APP[K]['actions'];
        };
        request: Request;
        response: Response;
    };
    Modules: RootModuleAPI<APP>;
    Actions: RootModuleActions<APP>;
};
export declare function proxyPollyfill(typeName: string, json?: string): void;
export declare function exportApp(): FacadeExports<any, any, any, any>;
export declare function buildApp(moduleGetter: ModuleGetter, { appModuleName, appViewName, historyType, locationTransform, storeOptions, container, }: {
    appModuleName?: string;
    appViewName?: string;
    historyType?: 'Browser' | 'Hash' | 'Memory';
    locationTransform: LocationTransform<any>;
    storeOptions?: StoreOptions;
    container?: string;
}): Promise<{
    store: import("@medux/core/types").ModuleStore;
}>;
export declare function setSsrHtmlTpl(tpl: string): void;
export declare function buildSSR(moduleGetter: ModuleGetter, { request, response, appModuleName, appViewName, locationTransform, storeOptions, container, }: {
    appModuleName?: string;
    appViewName?: string;
    request: ServerRequest;
    response: ServerResponse;
    locationTransform: LocationTransform<any>;
    storeOptions?: StoreOptions;
    container?: string;
}): Promise<string>;
export declare type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;
export declare type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;
export interface Connect {
    <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, mapDispatchToProps?: (dispatch: Dispatch, owner: W) => D, options?: ReactReduxOptions<any, S, W>): InferableComponentEnhancerWithProps<S & D & {
        dispatch: Dispatch;
    }>;
}
export declare const connect: Connect;
interface ElseProps {
    elseView?: ReactNode;
    children: ReactNode;
}
export declare const Else: React.NamedExoticComponent<ElseProps>;
interface SwitchProps {
    elseView?: ReactNode;
    children: ReactNode;
}
export declare const Switch: React.NamedExoticComponent<SwitchProps>;
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    replace?: boolean;
}
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
interface DocumentHeadProps {
    children?: ReactNode;
}
export declare const DocumentHead: React.NamedExoticComponent<DocumentHeadProps>;
