import {connect} from 'react-redux';
import type {Options} from 'react-redux';
import type {ComponentType, FunctionComponent, ComponentClass} from 'react';
import type {Dispatch} from '@medux/core';

export type GetProps<C> = C extends FunctionComponent<infer P> ? P : C extends ComponentClass<infer P> ? P : never;

export type InferableComponentEnhancerWithProps<TInjectedProps> = <C>(component: C) => ComponentType<Omit<GetProps<C>, keyof TInjectedProps>>;

export interface ConnectRedux {
  <S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options<any, S, W>): InferableComponentEnhancerWithProps<S & D & {dispatch: Dispatch}>;
}

export const connectRedux: ConnectRedux = connect as any;
