import React, {ComponentType, useEffect, useState, ForwardRefRenderFunction} from 'react';
import {RootModuleFacade, getView, isPromise, env} from '@medux/core';
import type {BaseLoadView} from '@medux/core';

export type LoadView<A extends RootModuleFacade = {}> = BaseLoadView<A, ComponentType<any>>;

const LoadViewOnError: ComponentType<any> = () => {
  return <div>error</div>;
};

export const loadView: LoadView = (moduleName, viewName, options) => {
  const {OnLoading, OnError} = options || {};
  // Can't perform a React state update on an unmounted component.
  let active = true;
  const Loader: ForwardRefRenderFunction<any> = function ViewLoader(props, ref) {
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
            active && setView({Component: OnError || LoadViewOnError});
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
    // eslint-disable-next-line no-nested-ternary
    return view ? <view.Component {...props} ref={ref} /> : OnLoading ? <OnLoading {...props} /> : null;
  };
  const Component = React.forwardRef(Loader);

  return Component as any;
};
