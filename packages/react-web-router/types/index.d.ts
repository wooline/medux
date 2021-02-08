/// <reference path="../env/global.d.ts" />
import type { ComponentType, ReactElement } from 'react';
import type { ModuleGetter, StoreOptions, ExportModule } from '@medux/core';
import type { LocationTransform } from '@medux/route-web';
import type { ServerRequest, ServerResponse } from './sington';
export type { RootModuleFacade, Dispatch } from '@medux/core';
export type { Store } from 'redux';
export type { RouteModuleState as BaseModuleState, RootState, RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial } from '@medux/route-web';
export type { LoadView } from './loadView';
export type { FacadeExports, ServerRequest, ServerResponse } from './sington';
export { ActionTypes, delayPromise, LoadingState, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, logger, setLoadingDepthTime, isServer, serverSide, clientSide, deepMerge, deepMergeState, isProcessedError, setProcessedError, } from '@medux/core';
export { RouteModuleHandlers as BaseModuleHandlers, createLocationTransform } from '@medux/route-web';
export { exportApp, patchActions } from './sington';
export { DocumentHead } from './components/DocumentHead';
export { Else } from './components/Else';
export { Switch } from './components/Switch';
export { Link } from './components/Link';
export declare function setConfig(conf: {
    RSP?: string;
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    pagenames?: {
        [key: string]: string;
    };
    NSP?: string;
    MSP?: string;
    SSRKey?: string;
    MutableData?: boolean;
    DEVTOOLS?: boolean;
    LoadViewOnError?: ReactElement;
    LoadViewOnLoading?: ReactElement;
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
