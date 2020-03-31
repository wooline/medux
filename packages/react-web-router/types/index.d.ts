import { TransformRoute, MeduxLocation } from '@medux/route-plan-a';
import { RootState as BaseRootState, ModuleGetter, StoreOptions, StoreState } from '@medux/core';
import { History } from 'history';
import { Store } from 'redux';
import React, { ReactElement } from 'react';
import { HistoryActions, ToBrowserUrl } from '@medux/web';
export { loadView, exportModule } from '@medux/react';
export { ActionTypes, delayPromise, LoadingState, exportActions, BaseModelHandlers, effect, errorAction, reducer } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
export type { Actions, RouteData, RouteViews, BaseModelState } from '@medux/core';
export type { LoadView } from '@medux/react';
export type { RouteConfig } from '@medux/route-plan-a';
export declare type BrowserRouter<Params> = {
    transformRoute: TransformRoute;
    historyActions: HistoryActions<Params>;
    toUrl: ToBrowserUrl<Params>;
};
export declare function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>({ moduleGetter, appModuleName, history, routeConfig, defaultRouteParams, storeOptions, container, beforeRender, }: {
    moduleGetter: M;
    appModuleName: A;
    history: History;
    routeConfig?: import('@medux/route-plan-a').RouteConfig;
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
export declare function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>({ moduleGetter, appModuleName, location, routeConfig, defaultRouteParams, storeOptions, renderToStream, beforeRender, }: {
    moduleGetter: M;
    appModuleName: A;
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
