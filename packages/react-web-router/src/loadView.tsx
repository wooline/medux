import React, {ComponentType, FC, useEffect, useState} from 'react';
import {RootModuleFacade, getView, isPromise} from '@medux/core';
import type {BaseLoadView} from '@medux/core';

export type LoadView<A extends RootModuleFacade = {}> = BaseLoadView<A, {forwardRef?: boolean}, ComponentType<any>>;

const LoadViewOnError: ComponentType<any> = () => {
  return <div>error</div>;
};
export const loadView: LoadView = (moduleName, viewName, options, Loading, Error) => {
  const {forwardRef} = options || {};
  // Can't perform a React state update on an unmounted component.
  let active = true;
  const Loader: FC<any> = function ViewLoader(props: any) {
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
          .catch(() => {
            active && setView({Component: Error || LoadViewOnError});
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
    const {forwardRef2, ...other} = props;
    const ref = forwardRef ? {ref: forwardRef2} : {};
    // eslint-disable-next-line no-nested-ternary
    return view ? <view.Component {...other} {...ref} /> : Loading ? <Loading {...props} /> : null;
  };
  const Component = forwardRef ? React.forwardRef((props, ref) => <Loader {...props} forwardRef={ref} />) : Loader;

  return Component as any;
};