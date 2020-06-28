import './env';
import { CommonModule } from '@medux/core';
import { InitAppOptions } from '@medux/mini-program';
import { InferableComponentEnhancer, DefaultRootState, ResolveThunks, MapStateToPropsParam, MapDispatchToPropsNonObject, InferableComponentEnhancerWithProps, MapDispatchToPropsParam } from 'react-redux';
export { ActionTypes, delayPromise, client, env, isDevelopmentEnv, LoadingState, exportActions, BaseModelHandlers, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime, } from '@medux/core';
export type { Actions, RouteData, RouteViews, BaseModelState } from '@medux/core';
export type { RouteConfig, LocationMap, RootState, BrowserRouter } from '@medux/mini-program';
export { exportModule } from '@medux/mini-program';
export interface DispatchProp {
    dispatch?: (action: {
        type: string;
    }) => any;
}
export declare function buildApp(options: Omit<InitAppOptions, 'startupUrl'>): {
    store: import("redux").Store<any, import("redux").AnyAction>;
    historyActions: import("@medux/mini-program/types/history").HistoryActions<{}>;
    toBrowserUrl: import("@medux/mini-program/types/history").ToBrowserUrl<{}>;
    transformRoute: import("@medux/route-plan-a/types").TransformRoute;
};
export declare const connectView: ConnectView;
export interface ConnectView {
    (module: CommonModule, useForwardRef: boolean): InferableComponentEnhancer<DispatchProp>;
    <TStateProps = {}, no_dispatch = {}, TOwnProps = {}, State = DefaultRootState>(module: CommonModule, useForwardRef: boolean, mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>): InferableComponentEnhancerWithProps<TStateProps & DispatchProp, TOwnProps>;
    <no_state = {}, TDispatchProps = {}, TOwnProps = {}>(module: CommonModule, useForwardRef: boolean, mapStateToProps: null | undefined, mapDispatchToProps: MapDispatchToPropsNonObject<TDispatchProps, TOwnProps>): InferableComponentEnhancerWithProps<TDispatchProps, TOwnProps>;
    <no_state = {}, TDispatchProps = {}, TOwnProps = {}>(module: CommonModule, useForwardRef: boolean, mapStateToProps: null | undefined, mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>): InferableComponentEnhancerWithProps<ResolveThunks<TDispatchProps>, TOwnProps>;
    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = DefaultRootState>(module: CommonModule, useForwardRef: boolean, mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>, mapDispatchToProps: MapDispatchToPropsNonObject<TDispatchProps, TOwnProps>): InferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps>;
    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = DefaultRootState>(module: CommonModule, useForwardRef: boolean, mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>, mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>): InferableComponentEnhancerWithProps<TStateProps & ResolveThunks<TDispatchProps>, TOwnProps>;
}
