import './env';
import { RootState as BaseRootState, CommonModule, ExportModule, ModuleGetter, StoreOptions } from '@medux/core';
import { HistoryActions, ToBrowserUrl } from './history';
import { MeduxLocation, TransformRoute } from '@medux/route-plan-a';
import { Store } from 'redux';
export type { RouteConfig } from '@medux/route-plan-a';
export type { LocationMap } from './history';
export declare type RootState<G extends ModuleGetter> = BaseRootState<G, MeduxLocation>;
export declare type BrowserRouter<Params> = {
    transformRoute: TransformRoute;
    historyActions: HistoryActions<Params>;
    toUrl: ToBrowserUrl<Params>;
};
export declare const exportModule: ExportModule<any>;
export interface InitAppOptions {
    startupUrl: string;
    moduleGetter: ModuleGetter;
    appModule: CommonModule;
    appViewName?: string;
    routeConfig?: import('@medux/route-plan-a').RouteConfig;
    locationMap?: import('./history').LocationMap;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
    storeOptions?: StoreOptions;
}
export declare function initApp({ startupUrl, moduleGetter, appModule, appViewName, routeConfig, locationMap, defaultRouteParams, storeOptions }: InitAppOptions): {
    store: Store<any, import("redux").AnyAction>;
    historyActions: HistoryActions<{}>;
    toBrowserUrl: ToBrowserUrl<{}>;
    transformRoute: TransformRoute;
};
