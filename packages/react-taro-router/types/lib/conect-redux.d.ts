import type { Options } from 'react-redux';
import type { ComponentType, FunctionComponent, ComponentClass } from 'react';
import type { Dispatch } from '@medux/core';
export { Provider } from 'react-redux';
export declare type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;
export declare type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;
export interface ConnectRedux {
    <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options<any, S, W>): InferableComponentEnhancerWithProps<S & D & {
        dispatch: Dispatch;
    }>;
}
export declare const connectRedux: ConnectRedux;
export declare function connectPage(page: ComponentType): ComponentType;
