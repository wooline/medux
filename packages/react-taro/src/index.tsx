/* global process */
import './env';
import {env, CommonModule, cacheModule, loadModel} from '@medux/core';
import {initApp, InitAppOptions} from '@medux/mini-program';
import React, {FC} from 'react';
import {connect} from 'react-redux';
import {
  InferableComponentEnhancer,
  DefaultRootState,
  ResolveThunks,
  MapStateToPropsParam,
  MapDispatchToPropsNonObject,
  InferableComponentEnhancerWithProps,
  MapDispatchToPropsParam,
} from 'react-redux';

export {
  ActionTypes,
  delayPromise,
  client,
  env,
  isDevelopmentEnv,
  LoadingState,
  exportActions,
  BaseModelHandlers,
  modelHotReplacement,
  effect,
  errorAction,
  reducer,
  viewHotReplacement,
  setLoading,
  setConfig,
  logger,
  setLoadingDepthTime,
} from '@medux/core';

export type {Actions, RouteData, RouteViews, BaseModelState} from '@medux/core';

export type {RouteConfig, LocationMap, RootState, BrowserRouter} from '@medux/mini-program';
export {exportModule} from '@medux/mini-program';

export interface DispatchProp {
  dispatch?: (action: {type: string}) => any;
}

function toUrl(pathname: string, query: {[key: string]: string}) {
  pathname = ('/' + pathname).replace('//', '/');
  let search = Object.keys(query)
    .map((key) => key + '=' + query[key])
    .join('&');
  if (search) {
    search = '?' + search;
  }
  return {pathname, search};
}
export function buildApp(options: Omit<InitAppOptions, 'startupUrl'>) {
  const {path, query} = env.getLaunchOptionsSync();
  const {pathname, search} = toUrl(path, query);

  const result = initApp({...options, startupUrl: pathname + search});
  if (process.env.TARO_ENV === 'h5') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {history}: {history: meduxCore.History} = require('@tarojs/router');
    history.listen((location, action) => {
      result.historyActions.passive({...location, action});
    });
  } else {
    env.onAppRoute(function (res) {
      const {pathname, search} = toUrl(res.path, res.query);
      result.historyActions.passive({pathname, search, hash: '', action: 'PUSH'});
    });
  }
  return result;
}
export const connectView: ConnectView = function (module: CommonModule, useForwardRef: boolean, ...rest: any[]) {
  cacheModule(module);
  // @ts-ignore
  const connectedComponent = connect(...rest);
  return (...args: any[]) => {
    const Raw: React.ComponentType<any> = connectedComponent(...args);
    const Loader: FC<any> = function ViewLoader(props: any) {
      loadModel(module.default.moduleName);
      const {forwardRef, ...other} = props;
      const ref = forwardRef ? {ref: forwardRef} : {};
      return <Raw {...other} {...ref} />;
    };
    // eslint-disable-next-line react/display-name
    const Component = useForwardRef ? React.forwardRef((props, ref) => <Loader {...props} forwardRef={ref} />) : Loader;
    return Component as any;
  };
};

export interface ConnectView {
  // tslint:disable:no-unnecessary-generics
  (module: CommonModule, useForwardRef: boolean): InferableComponentEnhancer<DispatchProp>;

  <TStateProps = {}, no_dispatch = {}, TOwnProps = {}, State = DefaultRootState>(
    module: CommonModule,
    useForwardRef: boolean,
    mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>
  ): InferableComponentEnhancerWithProps<TStateProps & DispatchProp, TOwnProps>;

  <no_state = {}, TDispatchProps = {}, TOwnProps = {}>(
    module: CommonModule,
    useForwardRef: boolean,
    mapStateToProps: null | undefined,
    mapDispatchToProps: MapDispatchToPropsNonObject<TDispatchProps, TOwnProps>
  ): InferableComponentEnhancerWithProps<TDispatchProps, TOwnProps>;

  <no_state = {}, TDispatchProps = {}, TOwnProps = {}>(
    module: CommonModule,
    useForwardRef: boolean,
    mapStateToProps: null | undefined,
    mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>
  ): InferableComponentEnhancerWithProps<ResolveThunks<TDispatchProps>, TOwnProps>;

  <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = DefaultRootState>(
    module: CommonModule,
    useForwardRef: boolean,
    mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
    mapDispatchToProps: MapDispatchToPropsNonObject<TDispatchProps, TOwnProps>
  ): InferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps>;

  <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = DefaultRootState>(
    module: CommonModule,
    useForwardRef: boolean,
    mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
    mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>
  ): InferableComponentEnhancerWithProps<TStateProps & ResolveThunks<TDispatchProps>, TOwnProps>;
}
