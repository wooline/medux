import './env';
import { Store, Dispatch } from 'redux';
import { ExportModule, RootState as BaseRootState, ModuleGetter, StoreOptions, StoreState } from '@medux/core';
import { TransformRoute, MeduxLocation } from '@medux/route-plan-a';
import { HistoryActions, ToBrowserUrl } from './history';
export { connectView } from './connectView';
export { connectPage } from './connectPage';
export { ActionTypes, delayPromise, client, env, isDevelopmentEnv, LoadingState, exportActions, BaseModelHandlers, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
export type { Actions, RouteData, RouteViews, BaseModelState } from '@medux/core';
export type { RouteConfig } from '@medux/route-plan-a';
export declare function buildApp({ moduleGetter, appModuleName, routeConfig, pathnameMap, defaultRouteParams, storeOptions, beforeRender, }: {
    moduleGetter: ModuleGetter;
    appModuleName: string;
    routeConfig?: import('@medux/route-plan-a').RouteConfig;
    pathnameMap?: import('@medux/route-plan-a').PathnameMap;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
    storeOptions?: StoreOptions;
    beforeRender?: (data: {
        store: Store<StoreState>;
        historyActions: HistoryActions;
        toBrowserUrl: ToBrowserUrl;
        transformRoute: TransformRoute;
    }) => Store<StoreState>;
}): Promise<void>;
export declare type RootState<G extends ModuleGetter> = BaseRootState<G, MeduxLocation>;
export declare type BrowserRouter<Params> = {
    transformRoute: TransformRoute;
    historyActions: HistoryActions<Params>;
    toUrl: ToBrowserUrl<Params>;
};
export declare const exportModule: ExportModule<{}>;
export interface DispatchProp {
    dispatch: Dispatch;
}