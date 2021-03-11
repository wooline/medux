/// <reference path="../env/global.d.ts" />
import type { ComponentType } from 'react';
import type { ModuleGetter, StoreOptions, ExportModule, ModuleStore } from '@medux/core';
import type { LocationTransform } from '@medux/route-web';
export type { RootModuleFacade, Dispatch } from '@medux/core';
export type { Store } from 'redux';
export type { RouteModuleState as BaseModuleState, RootState, RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial } from '@medux/route-web';
export type { LoadView } from './loadView';
export type { FacadeExports } from './sington';
export { ActionTypes, delayPromise, LoadingState, env, effect, errorAction, reducer, setLoading, logger, setLoadingDepthTime, deepMerge, deepMergeState, isProcessedError, setProcessedError, } from '@medux/core';
export { RouteModuleHandlers as BaseModuleHandlers, createLocationTransform } from '@medux/route-web';
export { eventBus } from './patch';
export { exportApp, patchActions } from './sington';
export { Else } from './components/Else';
export { Switch } from './components/Switch';
export declare function setConfig(conf: {
    RSP?: string;
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    pagenames?: {
        [key: string]: string;
    };
    NSP?: string;
    MSP?: string;
    MutableData?: boolean;
    DEVTOOLS?: boolean;
    LoadViewOnError?: ComponentType<{
        message: string;
    }>;
    LoadViewOnLoading?: ComponentType<{}>;
    disableNativeRoute?: boolean;
}): void;
export declare const exportModule: ExportModule<ComponentType<any>>;
export declare function buildApp(moduleGetter: ModuleGetter, { appModuleName, appViewName, locationTransform, storeOptions, }: {
    appModuleName?: string;
    appViewName?: string;
    locationTransform: LocationTransform<any>;
    storeOptions?: StoreOptions;
}, startup: (store: ModuleStore) => void): Promise<ModuleStore>;
