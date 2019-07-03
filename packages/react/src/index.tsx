import {ExportModule, LoadView, ModuleGetter, StoreOptions} from '@medux/core/types/export';
import React, {ComponentType, FunctionComponent, ReactNode, useEffect, useState} from 'react';
import {exportModule as baseExportModule, renderApp as baseRenderApp, renderSSR as baseRenderSSR, getView, isPromiseView, isServer, viewWillMount, viewWillUnmount} from '@medux/core';

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
let autoID = 0;
export const loadView: LoadView = (moduleGetter, moduleName, viewName, Loading?: ComponentType<any>) => {
  let loader: FunctionComponent<any> = null as any;
  if (isServer()) {
    const onFocus = () => void 0;
    const onBlur = () => void 0;
    loader = function Loader(props: any) {
      const [view] = useState<{Component: ComponentType} | null>(() => {
        const moduleViewResult = getView<ComponentType>(moduleGetter, moduleName, viewName);
        if (isPromiseView<ComponentType>(moduleViewResult)) {
          return null;
        } else {
          Object.keys(loader).forEach(key => (moduleViewResult[key] = loader[key]));
          Object.keys(moduleViewResult).forEach(key => (loader[key] = moduleViewResult[key]));
          return {Component: moduleViewResult};
        }
      });
      return view ? <view.Component {...props} onFocus={onFocus} onBlur={onBlur} /> : Loading ? <Loading {...props} /> : null;
    };
  } else {
    const aid = autoID++;
    const onFocus = () => viewWillMount(moduleName, viewName, aid + '');
    const onBlur = () => viewWillUnmount(moduleName, viewName, aid + '');
    loader = function Loader(props: any) {
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
      useEffect(() => {
        if (view) {
          let subscriptions: {didFocus: null | {remove: Function}; didBlur: null | {remove: Function}} = {didFocus: null, didBlur: null};
          if (props.navigation) {
            subscriptions.didFocus = props.navigation.addListener('didFocus', onFocus);
            subscriptions.didBlur = props.navigation.addListener('didBlur', onBlur);
          }
          viewWillMount(moduleName, viewName, aid + '');

          return () => {
            subscriptions.didFocus && subscriptions.didFocus.remove();
            subscriptions.didBlur && subscriptions.didBlur.remove();
            viewWillUnmount(moduleName, viewName, aid + '');
          };
        } else {
          return void 0;
        }
      }, [view]);
      return view ? <view.Component {...props} onFocus={onFocus} onBlur={onBlur} /> : Loading ? <Loading {...props} /> : null;
    };
  }
  return loader as any;
};

export const exportModule: ExportModule<ComponentType<any>> = baseExportModule;
