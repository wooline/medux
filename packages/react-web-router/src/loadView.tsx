import React, {ComponentType, useEffect, useState, ForwardRefRenderFunction, ReactElement} from 'react';
import {RootModuleFacade, getView, isPromise, env} from '@medux/core';
import type {BaseLoadView} from '@medux/core';

export type LoadView<A extends RootModuleFacade = {}> = BaseLoadView<A, {OnError?: ReactElement; OnLoading?: ReactElement}>;

const loadViewDefaultOptions: {LoadViewOnError: ReactElement; LoadViewOnLoading: ReactElement} = {
  LoadViewOnError: <div className="g-loadview-error">error</div>,
  LoadViewOnLoading: <div className="g-loadview-loading">loading</div>,
};
export function setLoadViewOptions({LoadViewOnError, LoadViewOnLoading}: {LoadViewOnError?: ReactElement; LoadViewOnLoading?: ReactElement}) {
  LoadViewOnError && (loadViewDefaultOptions.LoadViewOnError = LoadViewOnError);
  LoadViewOnLoading && (loadViewDefaultOptions.LoadViewOnLoading = LoadViewOnLoading);
}

export const loadView: LoadView = (moduleName, viewName, options) => {
  const {OnLoading, OnError} = options || {};
  // Can't perform a React state update on an unmounted component.
  let active = true;
  const Loader: ForwardRefRenderFunction<any> = function ViewLoader(props, ref) {
    const OnErrorComponent = OnError || loadViewDefaultOptions.LoadViewOnError;
    const OnLoadingComponent = OnLoading || loadViewDefaultOptions.LoadViewOnLoading;
    useEffect(() => {
      return () => {
        active = false;
      };
    }, []);
    const [view, setView] = useState<{Component: ComponentType<any>} | null>(() => {
      const moduleViewResult = getView<ComponentType>(moduleName, viewName);
      if (isPromise(moduleViewResult)) {
        moduleViewResult
          .then((Component) => {
            // loader.propTypes = Component.propTypes;
            // loader.contextTypes = Component.contextTypes;
            // loader.defaultProps = Component.defaultProps;
            // Object.keys(loader).forEach(key => (Component[key] = loader[key]));
            // Object.keys(Component).forEach(key => (loader[key] = Component[key]));
            active && setView({Component});
          })
          .catch((e: any) => {
            active && setView({Component: () => OnErrorComponent});
            env.console.error(e);
          });
        return null;
      }
      // loader.propTypes = moduleViewResult.propTypes;
      // loader.contextTypes = moduleViewResult.contextTypes;
      // loader.defaultProps = moduleViewResult.defaultProps;
      // Object.keys(loader).forEach(key => (moduleViewResult[key] = loader[key]));
      // Object.keys(moduleViewResult).forEach(key => (loader[key] = moduleViewResult[key]));
      return {Component: moduleViewResult};
    });
    return view ? <view.Component {...props} ref={ref} /> : OnLoadingComponent;
  };
  const Component = React.forwardRef(Loader);

  return Component as any;
};
