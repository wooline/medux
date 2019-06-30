import {ExportModule, LoadView, ModuleGetter, StoreOptions} from '@medux/core/types/export';
import React, {ComponentType, FunctionComponent, ReactNode, useEffect, useState} from 'react';
import {exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView, viewWillMount, viewWillUnmount} from '@medux/core';

import {Provider} from 'react-redux';

export function renderApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  render: (Provider: ComponentType<{children: ReactNode}>, AppMainView: ComponentType<any>, ssrInitStoreKey: string) => void,
  moduleGetter: M,
  appModuleName: A,
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
    storeOptions
  );
}

export function renderSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  render: (Provider: ComponentType<{children: ReactNode}>, AppMainView: ComponentType<any>) => any,
  moduleGetter: M,
  appModuleName: A,
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
    storeOptions
  );
}

export const loadView: LoadView = (moduleGetter, moduleName, viewName, Loading?: ComponentType<any>) => {
  const loader: FunctionComponent<any> = function Loader(props: any) {
    const [view, setView] = useState<{Component: ComponentType} | null>(() => {
      const moduleViewResult = getView<ComponentType>(moduleGetter, moduleName, viewName);
      if (isPromiseView<ComponentType>(moduleViewResult)) {
        moduleViewResult.then(Component => {
          loader.propTypes = Component.propTypes;
          loader.contextTypes = Component.contextTypes;
          loader.defaultProps = Component.defaultProps;
          setView({Component});
        });
        return null;
      } else {
        loader.propTypes = moduleViewResult.propTypes;
        loader.contextTypes = moduleViewResult.contextTypes;
        loader.defaultProps = moduleViewResult.defaultProps;
        return {Component: moduleViewResult};
      }
    });
    useEffect(() => {
      if (view) {
        viewWillMount(moduleName, viewName);
        return () => {
          viewWillUnmount(moduleName, viewName);
        };
      } else {
        return void 0;
      }
    }, [view]);
    return view ? <view.Component {...props} /> : Loading ? <Loading {...props} /> : null;
  };
  return loader as any;
};

export const exportModule: ExportModule<ComponentType<any>> = baseExportModule;
