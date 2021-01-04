import type { Dispatch } from '@medux/core';
import { ComponentType, FunctionComponent, ComponentClass } from 'react';
export declare type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;
export declare type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;
export interface SimpleConnect<Options> {
    <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options): InferableComponentEnhancerWithProps<S & D & {
        dispatch: Dispatch;
    }>;
}
export {};
