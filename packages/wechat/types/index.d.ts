import './env';
import { Store } from 'redux';
import { CommonModule, ExportModule, RootState as BaseRootState, ModuleGetter, StoreOptions, StoreState } from '@medux/core';
import { TransformRoute, MeduxLocation } from '@medux/route-plan-a';
import { HistoryActions, ToBrowserUrl } from './history';
export { connectComponent } from './connectComponent';
export { connectPage } from './connectPage';
export { ActionTypes, delayPromise, client, env, isDevelopmentEnv, LoadingState, exportActions, BaseModelHandlers, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, } from '@medux/core';
export { setRouteConfig } from '@medux/route-plan-a';
export type { Actions, RouteData, RouteViews, BaseModelState } from '@medux/core';
export type { RouteConfig } from '@medux/route-plan-a';
export type { LocationMap } from './history';
export declare function buildApp({ moduleGetter, appModule, routeConfig, locationMap, defaultRouteParams, storeOptions, beforeRender, }: {
    moduleGetter: ModuleGetter;
    appModule: CommonModule;
    routeConfig?: import('@medux/route-plan-a').RouteConfig;
    locationMap?: import('./history').LocationMap;
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
export declare const exportModule: ExportModule<any>;
export interface DispatchProp {
    dispatch?: (action: {
        type: string;
    }) => any;
}
