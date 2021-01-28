import { ComponentType } from 'react';
import { RootModuleFacade } from '@medux/core';
import type { BaseLoadView } from '@medux/core';
export declare type LoadView<A extends RootModuleFacade = {}> = BaseLoadView<A, ComponentType<any>>;
export declare const loadView: LoadView;
