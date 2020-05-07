import * as core from '@medux/core';

import {ExportModule, HistoryProxy, ModuleGetter, StoreOptions, StoreState, getView, isPromiseView} from '@medux/core';
import React, {ComponentType, FC, ReactElement, useState} from 'react';
import {renderToNodeStream, renderToString} from 'react-dom/server';

import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';
import {Store} from 'redux';

export function renderApp(
  moduleGetter: ModuleGetter,
  appModuleName: string,
  historyProxy: HistoryProxy,
  storeOptions: StoreOptions,
  container: string | Element | ((component: ReactElement<any>) => void) = 'root',
  beforeRender?: (store: Store<StoreState>) => Store<StoreState>
) {
  return core.renderApp<ComponentType<any>>(
    (store, appModel, AppView, ssrInitStoreKey) => {
      const reRender = (View: ComponentType<any>) => {
        const reduxProvider = (
          <Provider store={store}>
            <View />
          </Provider>
        );
        if (typeof container === 'function') {
          container(reduxProvider);
        } else {
          const panel = typeof container === 'string' ? document.getElementById(container) : container;
          ReactDOM.unmountComponentAtNode(panel!);
          const render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
          render(reduxProvider, panel);
        }
      };
      reRender(AppView);
      return reRender;
    },
    moduleGetter,
    appModuleName,
    historyProxy,
    storeOptions,
    beforeRender
  );
}

export function renderSSR(
  moduleGetter: ModuleGetter,
  appModuleName: string,
  historyProxy: HistoryProxy,
  storeOptions: StoreOptions = {},
  renderToStream: boolean = false,
  beforeRender?: (store: Store<StoreState>) => Store<StoreState>
) {
  return core.renderSSR<ComponentType<any>>(
    (store, appModel, AppView, ssrInitStoreKey) => {
      const data = store.getState();
      const reduxProvider = (
        <Provider store={store}>
          <AppView />
        </Provider>
      );
      const render = renderToStream ? renderToNodeStream : renderToString;
      return {
        store,
        ssrInitStoreKey,
        data,
        html: render(reduxProvider),
      };
    },
    moduleGetter,
    appModuleName,
    historyProxy,
    storeOptions,
    beforeRender
  );
}

export type LoadView<T extends ModuleGetter> = core.LoadView<T, {forwardRef?: boolean}, ComponentType<any>>;

const LoadViewOnError: ComponentType<any> = () => {
  return <div>error</div>;
};
export const loadView: LoadView<any> = (moduleName, viewName, options, Loading, Error) => {
  const {forwardRef, ...modelOptions} = options || {};
  const Loader: FC<any> = function ViewLoader(props: any) {
    const [view, setView] = useState<{Component: ComponentType<any>} | null>(() => {
      const moduleViewResult = getView<ComponentType>(moduleName, viewName, modelOptions);
      if (isPromiseView<ComponentType>(moduleViewResult)) {
        moduleViewResult
          .then((Component) => {
            // loader.propTypes = Component.propTypes;
            // loader.contextTypes = Component.contextTypes;
            // loader.defaultProps = Component.defaultProps;
            // Object.keys(loader).forEach(key => (Component[key] = loader[key]));
            // Object.keys(Component).forEach(key => (loader[key] = Component[key]));
            setView({Component});
          })
          .catch(() => {
            setView({Component: Error || LoadViewOnError});
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

export const exportModule: ExportModule<ComponentType<any>> = core.exportModule;
