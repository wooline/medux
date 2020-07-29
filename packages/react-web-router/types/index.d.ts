/// <reference path="../env/global.d.ts" />
import { MeduxLocation } from '@medux/route-plan-a';
import { RootState as BaseRootState, ModuleGetter, StoreOptions, StoreState } from '@medux/core';
import { Store } from 'redux';
import React, { ReactElement } from 'react';
import { History } from '@medux/web';
import type { TransformRoute, RouteConfig } from '@medux/route-plan-a';
import type { HistoryActions, LocationMap } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime, } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
export type { Actions, RouteData, RouteViews, BaseModelState } from '@medux/core';
export type { LoadView } from '@medux/react';
export type { RouteConfig, TransformRoute } from '@medux/route-plan-a';
export type { LocationMap, HistoryActions } from '@medux/web';
export declare function buildApp({ moduleGetter, appModuleName, appViewName, history, routeConfig, locationMap, defaultRouteParams, storeOptions, container, beforeRender, }: {
    moduleGetter: ModuleGetter;
    appModuleName?: string;
    appViewName?: string;
    history: History;
    routeConfig?: RouteConfig;
    locationMap?: LocationMap;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
    storeOptions?: StoreOptions;
    container?: string | Element | ((component: ReactElement<any>) => void);
    beforeRender?: (data: {
        store: Store<StoreState>;
        history: History;
        historyActions: HistoryActions;
        transformRoute: TransformRoute;
    }) => Store<StoreState>;
}): Promise<void>;
export declare function buildSSR({ moduleGetter, appModuleName, appViewName, location, routeConfig, locationMap, defaultRouteParams, storeOptions, renderToStream, beforeRender, }: {
    moduleGetter: ModuleGetter;
    appModuleName?: string;
    appViewName?: string;
    location: string;
    routeConfig?: RouteConfig;
    locationMap?: LocationMap;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
    storeOptions?: StoreOptions;
    renderToStream?: boolean;
    beforeRender?: (data: {
        store: Store<StoreState>;
        history: History;
        historyActions: HistoryActions;
        transformRoute: TransformRoute;
    }) => Store<StoreState>;
}): Promise<{
    html: string | meduxCore.ReadableStream;
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
