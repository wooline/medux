import { ReactElement } from 'react';
import { RootModuleFacade } from '@medux/core';
import type { BaseLoadView } from '@medux/core';
export declare type LoadView<A extends RootModuleFacade = {}> = BaseLoadView<A, {
    OnError?: ReactElement;
    OnLoading?: ReactElement;
}>;
export declare function setLoadViewOptions({ LoadViewOnError, LoadViewOnLoading }: {
    LoadViewOnError?: ReactElement;
    LoadViewOnLoading?: ReactElement;
}): void;
export declare const loadView: LoadView;
