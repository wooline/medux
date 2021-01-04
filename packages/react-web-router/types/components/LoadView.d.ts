import { ComponentType } from 'react';
import { RootModuleFacade } from '@medux/core';
import type { LoadView as BaseLoadView } from '@medux/core';
export declare type LoadView<A extends RootModuleFacade = {}> = BaseLoadView<A, {
    forwardRef?: boolean;
}, ComponentType<any>>;
export declare const loadView: LoadView;
