import {LoadView as BaseLoadView, ExportModule, HistoryProxy, ModuleGetter, StoreOptions} from '@medux/core/types/export';
import React, {ComponentType, FC, ReactNode, useState} from 'react';
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

export type LoadView<T extends ModuleGetter> = BaseLoadView<T, {forwardRef?: boolean}, ComponentType<any>>;

export const loadView: LoadView<any> = (moduleName, viewName, options, Loading) => {
  const {forwardRef, ...modelOptions} = options || {};
  const Loader: FC<any> = function ViewLoader(props: any) {
    const [view, setView] = useState<{Component: ComponentType} | null>(() => {
      const moduleViewResult = getView<ComponentType>(moduleName, viewName, modelOptions);
      if (isPromiseView<ComponentType>(moduleViewResult)) {
        moduleViewResult.then(Component => {
          // loader.propTypes = Component.propTypes;
          // loader.contextTypes = Component.contextTypes;
          // loader.defaultProps = Component.defaultProps;
          // Object.keys(loader).forEach(key => (Component[key] = loader[key]));
          // Object.keys(Component).forEach(key => (loader[key] = Component[key]));
          setView({Component});
        });
        return null;
      } else {
        // loader.propTypes = moduleViewResult.propTypes;
        // loader.contextTypes = moduleViewResult.contextTypes;
        // loader.defaultProps = moduleViewResult.defaultProps;
        // Object.keys(loader).forEach(key => (moduleViewResult[key] = loader[key]));
        // Object.keys(moduleViewResult).forEach(key => (loader[key] = moduleViewResult[key]));
        return {Component: moduleViewResult};
      }
    });
    const {forwardRef, ...other} = props;
    const ref = forwardRef ? {ref: forwardRef} : {};
    return view ? <view.Component {...other} {...ref} /> : Loading ? <Loading {...props} /> : null;
  };
  // eslint-disable-next-line react/display-name
  const Component = forwardRef ? React.forwardRef((props, ref) => <Loader {...props} forwardRef={ref} />) : Loader;

  return Component as any;
};
// 776002663516496;
// export const loadView: LoadView<any> = (moduleName, viewName, options, Loading) => {
//   return class Loader extends React.Component {
//     public state: LoadViewState = {
//       Component: null,
//     };
//     public constructor(props: any, context?: any) {
//       super(props, context);
//       const moduleViewResult = getView<ComponentType>(moduleName, viewName, options);
//       if (isPromiseView<ComponentType>(moduleViewResult)) {
//         moduleViewResult.then(Component => {
//           Object.keys(Loader).forEach(key => (Component[key] = Loader[key]));
//           Object.keys(Component).forEach(key => (Loader[key] = Component[key]));
//           this.setState({
//             Component,
//           });
//         });
//       } else {
//         Object.keys(Loader).forEach(key => (moduleViewResult[key] = Loader[key]));
//         Object.keys(moduleViewResult).forEach(key => (Loader[key] = moduleViewResult[key]));
//         this.state = {
//           Component: moduleViewResult,
//         };
//       }
//     }
//     public render() {
//       const {Component} = this.state;
//       return Component ? <Component {...this.props} /> : Loading ? <Loading {...this.props} /> : null;
//     }
//   } as any;
// };

export const exportModule: ExportModule<ComponentType<any>> = baseExportModule;
