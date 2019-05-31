import React, {ReactElement, ComponentType, useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {renderToNodeStream, renderToString} from 'react-dom/server';
import {Provider} from 'react-redux';
import {createBrowserHistory} from 'history';
import createMemoryHistory from 'history/createMemoryHistory';
import {withRouter} from 'react-router-dom';
import {ConnectedRouter, connectRouter, routerMiddleware} from 'connected-react-router';
import {renderApp, renderSSR, getView, isPromiseView, viewWillMount, viewWillUnmount, isServer, getClientStore, ModuleGetter, StoreOptions, LoadView, ExportView} from '@medux/core';

export type RouterParser<T = any> = (nextRouter: T, prevRouter?: T) => T;

export function buildApp<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appModuleName: A,
  storeOptions: StoreOptions & {routerParser?: RouterParser} = {},
  container: string | Element | ((component: ReactElement<any>) => void) = 'root'
): Promise<void> {
  const history = createBrowserHistory();
  storeOptions.reducers = storeOptions.reducers || {};
  if (storeOptions.reducers && storeOptions.reducers.router) {
    throw new Error("the reducer name 'router' is not allowed");
  }
  const router = connectRouter(history);
  storeOptions.reducers.router = (state, action) => {
    const routerData = router(state.router, action as any);
    if (storeOptions.routerParser && state.router !== routerData) {
      state.router = storeOptions.routerParser(routerData, state.router);
    } else {
      state.router = routerData;
    }
  };
  storeOptions.middlewares = storeOptions.middlewares || [];
  storeOptions.middlewares.unshift(routerMiddleware(history));

  return renderApp(
    (
      store,
      appModel,
      appViews: {
        [key: string]: React.ComponentType<any>;
      },
      ssrInitStoreKey
    ) => {
      const WithRouter = withRouter(appViews.Main);
      const app = (
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <WithRouter />
          </ConnectedRouter>
        </Provider>
      );
      if (typeof container === 'function') {
        container(app);
      } else {
        const render = window[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
        render(app, typeof container === 'string' ? document.getElementById(container) : container);
      }
    },
    moduleGetter,
    appModuleName,
    storeOptions
  );
}

export function buildSSR<M extends ModuleGetter, A extends Extract<keyof M, string>>(
  moduleGetter: M,
  appModuleName: A,
  initialEntries: string[],
  storeOptions: StoreOptions & {routerParser?: RouterParser} = {},
  renderToStream: boolean = false
): Promise<{html: string | ReadableStream; data: any; ssrInitStoreKey: string}> {
  const history = createMemoryHistory({initialEntries});
  storeOptions.reducers = storeOptions.reducers || {};
  if (storeOptions.reducers && storeOptions.reducers.router) {
    throw new Error("the reducer name 'router' is not allowed");
  }
  const router = connectRouter(history);
  storeOptions.reducers.router = (state, action) => {
    const routerData = router(state.router, action as any);
    if (storeOptions.routerParser && state.router !== routerData) {
      state.router = storeOptions.routerParser(routerData, state.router);
    } else {
      state.router = routerData;
    }
  };
  storeOptions.middlewares = storeOptions.middlewares || [];
  storeOptions.middlewares.unshift(routerMiddleware(history));
  const render = renderToStream ? renderToNodeStream : renderToString;
  return renderSSR(
    (
      store,
      appModel,
      appViews: {
        [key: string]: React.ComponentType<any>;
      },
      ssrInitStoreKey
    ) => {
      const data = store.getState();
      return {
        ssrInitStoreKey,
        data,
        html: render(
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <appViews.Main />
            </ConnectedRouter>
          </Provider>
        ),
      };
    },
    moduleGetter,
    appModuleName,
    storeOptions
  );
}

export const loadView: LoadView = (moduleGetter, moduleName, viewName, loadingComponent: React.ReactNode = null) => {
  return function Loading(props: any) {
    const [Component, setComponent] = useState<ComponentType<any> | null>(() => {
      const moduleViewResult = getView(moduleGetter[moduleName], viewName);
      if (isPromiseView<ComponentType<any>>(moduleViewResult)) {
        moduleViewResult.then(view => {
          setComponent(view);
        });
        return null;
      } else {
        return moduleViewResult;
      }
    });
    return Component ? <Component {...props} /> : loadingComponent;
  } as any;
};
export const exportView: ExportView<ComponentType<any>> = (ComponentView, model, viewName) => {
  if (isServer()) {
    return ComponentView;
  } else {
    return function View(props) {
      const [modelReady, setModelReady] = useState(() => {
        const state = getClientStore().getState();
        const namespace = model.namespace;
        model(getClientStore()).then(() => {
          if (!modelReady) {
            setModelReady(true);
          }
        });
        return !!state[namespace];
      });
      useEffect(() => {
        viewWillMount(model.namespace, viewName);
        return () => {
          viewWillUnmount(model.namespace, viewName);
        };
      }, []);
      return modelReady ? <ComponentView {...props} /> : null;
    };
  }
};
