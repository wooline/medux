/// <reference path="../env/global.d.ts" />
import { TransformRoute, MeduxLocation } from '@medux/route-plan-a';
import { RootState as BaseRootState, ModuleGetter, StoreOptions, StoreState } from '@medux/core';
import { Store } from 'redux';
import React, { ReactElement } from 'react';
import { History, HistoryActions, ToBrowserUrl } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
export type { Actions, RouteData, RouteViews, BaseModelState } from '@medux/core';
export type { LoadView } from '@medux/react';
export type { RouteConfig } from '@medux/route-plan-a';
export type { LocationMap } from '@medux/web';
export declare type BrowserRouter<Params> = {
    transformRoute: TransformRoute;
    historyActions: HistoryActions<Params>;
    toUrl: ToBrowserUrl<Params>;
};
export declare function buildApp({ moduleGetter, appModuleName, history, routeConfig, locationMap, defaultRouteParams, storeOptions, container, beforeRender, }: {
    moduleGetter: ModuleGetter;
    appModuleName: string;
    history: History;
    routeConfig?: import('@medux/route-plan-a').RouteConfig;
    locationMap?: import('@medux/web').LocationMap;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
    storeOptions?: StoreOptions;
    container?: string | Element | ((component: ReactElement<any>) => void);
    beforeRender?: (data: {
        store: Store<StoreState>;
        history: History;
        historyActions: HistoryActions;
        toBrowserUrl: ToBrowserUrl;
        transformRoute: TransformRoute;
    }) => Store<StoreState>;
}): Promise<void>;
export declare function buildSSR({ moduleGetter, appModuleName, location, routeConfig, defaultRouteParams, storeOptions, renderToStream, beforeRender, }: {
    moduleGetter: ModuleGetter;
    appModuleName: string;
    location: string;
    routeConfig?: import('@medux/route-plan-a').RouteConfig;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
    storeOptions?: StoreOptions;
    renderToStream?: boolean;
    beforeRender?: (data: {
        store: Store<StoreState>;
        history: History;
        historyActions: HistoryActions;
        toBrowserUrl: ToBrowserUrl;
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
