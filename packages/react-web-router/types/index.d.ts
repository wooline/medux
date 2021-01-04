/// <reference path="../env/global.d.ts" />
import type { ComponentType } from 'react';
import type { ModuleGetter, StoreOptions, ExportModule } from '@medux/core';
import type { LocationTransform } from '@medux/web';
import type { ServerRequest, ServerResponse } from './sington';
export { ActionTypes, delayPromise, LoadingState, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, logger, setLoadingDepthTime, isServer, serverSide, deepMerge, deepMergeState, } from '@medux/core';
export { RouteModuleHandlers as BaseModuleHandlers, createWebLocationTransform } from '@medux/route-plan-a';
export { exportApp, patchActions } from './sington';
export { connectRedux } from './conectRedux';
export type { RootModuleFacade, Dispatch } from '@medux/core';
export type { Store } from 'redux';
export type { RouteModuleState as BaseModuleState, LocationMap, HistoryAction, Location, PathnameRules } from '@medux/route-plan-a';
export type { RootState, RouteState, LocationTransform } from '@medux/web';
export type { FacadeExports } from './sington';
export declare function setConfig(conf: {
    connect?: Function;
    RSP?: string;
    historyMax?: number;
    homeUri?: string;
    NSP?: string;
    MSP?: string;
    SSRKey?: string;
    MutableData?: boolean;
    DEVTOOLS?: boolean;
}): void;
export declare const exportModule: ExportModule<ComponentType<any>>;
export declare function buildApp(moduleGetter: ModuleGetter, { appModuleName, appViewName, historyType, locationTransform, storeOptions, container, }: {
    appModuleName?: string;
    appViewName?: string;
    historyType?: 'Browser' | 'Hash' | 'Memory';
    locationTransform: LocationTransform<any>;
    storeOptions?: StoreOptions;
    container?: string | Element;
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
