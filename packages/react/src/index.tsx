import {ExportModule, HistoryProxy, LoadView, ModuleGetter, StoreOptions} from '@medux/core/types/export';
import React, {ComponentType, ReactNode} from 'react';
import {exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView} from '@medux/core';

import {Provider} from 'react-redux';

export function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  render: (Provider: ComponentType<{children: ReactNode}>, AppMainView: any, ssrInitStoreKey: string) => void,
  moduleGetter: M,
  appModuleName: A,
  historyProxy: HistoryProxy,
  storeOptions: StoreOptions
) {
  return baseRenderApp(
    (
      store,
      appModel,
      appViews: {
        [key: string]: ComponentType<any>;
      },
      ssrInitStoreKey
    ) => {
      const ReduxProvider: ComponentType<{children: ReactNode}> = props => {
        // eslint-disable-next-line react/prop-types
        return <Provider store={store}>{props.children}</Provider>;
      };
      render(ReduxProvider, appViews.Main, ssrInitStoreKey);
    },
    moduleGetter,
    appModuleName,
    historyProxy,
    storeOptions
  );
}

export function renderSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  render: (Provider: ComponentType<{children: ReactNode}>, AppMainView: ComponentType<any>) => any,
  moduleGetter: M,
  appModuleName: A,
  historyProxy: HistoryProxy,
  storeOptions: StoreOptions = {}
) {
  return baseRenderSSR(
    (
      store,
      appModel,
      appViews: {
        [key: string]: React.ComponentType;
      },
      ssrInitStoreKey
    ) => {
      const data = store.getState();
      const ReduxProvider: ComponentType<{children: ReactNode}> = props => {
        // eslint-disable-next-line react/prop-types
        return <Provider store={store}>{props.children}</Provider>;
      };
      return {
        store,
        ssrInitStoreKey,
        data,
        html: render(ReduxProvider, appViews.Main),
      };
    },
    moduleGetter,
    appModuleName,
    historyProxy,
    storeOptions
  );
}
interface LoadViewState {
  Component: ComponentType<any> | null;
}
export const loadView: LoadView<any, ComponentType<any>> = (moduleName, viewName, Loading) => {
  return class Loader extends React.Component {
    public state: LoadViewState = {
      Component: null,
    };
    public constructor(props: any, context?: any) {
      super(props, context);
      const moduleViewResult = getView<ComponentType>(moduleName, viewName);
      if (isPromiseView<ComponentType>(moduleViewResult)) {
        moduleViewResult.then(Component => {
          Object.keys(Loader).forEach(key => (Component[key] = Loader[key]));
          Object.keys(Component).forEach(key => (Loader[key] = Component[key]));
          this.setState({
            Component,
          });
        });
      } else {
        Object.keys(Loader).forEach(key => (moduleViewResult[key] = Loader[key]));
        Object.keys(moduleViewResult).forEach(key => (Loader[key] = moduleViewResult[key]));
        this.state = {
          Component: moduleViewResult,
        };
      }
    }
    public render() {
      const {Component} = this.state;
      return Component ? <Component {...this.props} /> : Loading ? <Loading {...this.props} /> : null;
    }
  } as any;
};

export const exportModule: ExportModule<ComponentType<any>> = baseExportModule;
