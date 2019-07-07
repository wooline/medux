import {ExportModule, HistoryProxy, LoadView, ModuleGetter, StoreOptions} from '@medux/core/types/export';
import React, {ComponentType, FunctionComponent, ReactNode, useState} from 'react';
import {exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView, isServer, viewWillMount, viewWillUnmount} from '@medux/core';

import {Provider} from 'react-redux';

export function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  render: (Provider: ComponentType<{children: ReactNode}>, AppMainView: ComponentType<any>, ssrInitStoreKey: string) => void,
  moduleGetter: M,
  appModuleName: A,
  historyProxy: HistoryProxy,
  storeOptions: StoreOptions
): Promise<void> {
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

export const loadView: LoadView = (moduleGetter, moduleName, viewName, Loading?: ComponentType<any>) => {
  const loader: FunctionComponent<any> = function Loader(props: any) {
    const [view, setView] = useState<{Component: ComponentType} | null>(() => {
      const moduleViewResult = getView<ComponentType>(moduleGetter, moduleName, viewName);
      if (isPromiseView<ComponentType>(moduleViewResult)) {
        moduleViewResult.then(Component => {
          Object.keys(loader).forEach(key => (Component[key] = loader[key]));
          Object.keys(Component).forEach(key => (loader[key] = Component[key]));
          setView({Component});
        });
        return null;
      } else {
        Object.keys(loader).forEach(key => (moduleViewResult[key] = loader[key]));
        Object.keys(moduleViewResult).forEach(key => (loader[key] = moduleViewResult[key]));
        return {Component: moduleViewResult};
      }
    });
    return view ? <view.Component {...props} /> : Loading ? <Loading {...props} /> : null;
  };

  return loader as any;
};

export const exportModule: ExportModule<ComponentType<any>> = baseExportModule;
