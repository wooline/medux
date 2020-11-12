/// <reference path="../env/global.d.ts" />
import { ModuleGetter, StoreOptions } from '@medux/core';
import { Store } from 'redux';
import React, { ReactElement } from 'react';
import { HistoryActions } from '@medux/web';
import type { LocationMap, RouteRule } from '@medux/route-plan-a';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime, } from '@medux/core';
export { setRouteConfig, RouteModelHandlers as BaseModelHandlers } from '@medux/route-plan-a';
export type { Actions } from '@medux/core';
export type { LoadView } from '@medux/react';
export type { RootState, RouteRule, LocationMap } from '@medux/route-plan-a';
export type { HistoryActions } from '@medux/web';
export declare function buildApp({ moduleGetter, appModuleName, appViewName, historyType, routeRule, locationMap, defaultRouteParams, storeOptions, container, beforeRender, }: {
    moduleGetter: ModuleGetter;
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
    beforeRender?: (data: {
        store: Store;
        historyActions: HistoryActions;
    }) => Store;
}): Promise<void>;
export declare function buildSSR({ moduleGetter, appModuleName, appViewName, location, routeRule, locationMap, defaultRouteParams, storeOptions, renderToStream, beforeRender, }: {
    moduleGetter: ModuleGetter;
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
    beforeRender?: (data: {
        store: Store;
        historyActions: HistoryActions;
    }) => Store;
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
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
