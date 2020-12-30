/// <reference path="../env/global.d.ts" />
import * as core from '@medux/core';
import {RootModuleFacade, ExportModule, ModuleGetter, StoreOptions, env, getView, isPromise, ModuleStore} from '@medux/core';
import React, {ComponentType, FC, useEffect, useState} from 'react';
import {renderToString} from 'react-dom/server';
import ReactDOM from 'react-dom';

export function renderApp(
  moduleGetter: ModuleGetter,
  appModuleName: string,
  appViewName: string,
  storeOptions: StoreOptions,
  container: string | Element = 'root',
  beforeRender: (store: ModuleStore) => string[]
) {
  return core.renderApp<ComponentType<any>>(
    (store, appModel, AppView, ssrInitStoreKey) => {
      const reRender = (View: ComponentType<any>) => {
        const panel: any = typeof container === 'string' ? env.document.getElementById(container) : container;
        ReactDOM.unmountComponentAtNode(panel!);
        const render = env[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
        render(<View store={store} />, panel);
      };
      reRender(AppView);
      return reRender;
    },
    moduleGetter,
    appModuleName,
    appViewName,
    storeOptions,
    beforeRender
  );
}

export function renderSSR(moduleGetter: ModuleGetter, appModuleName: string, appViewName: string, storeOptions: StoreOptions = {}, beforeRender: (store: ModuleStore) => string[]) {
  return core.renderSSR<ComponentType<any>>(
    (store, appModel, AppView, ssrInitStoreKey) => {
      const data = store.getState();
      return {
        store,
        ssrInitStoreKey,
        data,
        html: renderToString(<AppView store={store} />),
      };
    },
    moduleGetter,
    appModuleName,
    appViewName,
    storeOptions,
    beforeRender
  );
}

export type LoadView<A extends RootModuleFacade = {}> = core.LoadView<A, {forwardRef?: boolean}, ComponentType<any>>;

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

export const exportModule: ExportModule<ComponentType<any>> = core.exportModule;
