import { ComponentType } from 'react';
import { RootModuleFacade } from '@medux/core';
import type { BaseLoadView } from '@medux/core';
export declare type LoadView<A extends RootModuleFacade = {}> = BaseLoadView<A, {
    OnError?: ComponentType<{
        message: string;
    }>;
    OnLoading?: ComponentType<{}>;
}>;
export declare function setLoadViewOptions({ LoadViewOnError, LoadViewOnLoading, }: {
    LoadViewOnError?: ComponentType<{
        message: string;
    }>;
    LoadViewOnLoading?: ComponentType<{}>;
}): void;
export declare const loadView: LoadView;
