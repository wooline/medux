import {RootState as BaseRootState, ExportModule, LoadView, Model, ModuleGetter, StoreOptions} from '@medux/core/types/export';
import {ConnectedRouter, RouterState, connectRouter, routerMiddleware} from 'connected-react-router';
import React, {ComponentType, FunctionComponent, ReactElement, useEffect, useState} from 'react';
import {exportModule as baseExportModule, getClientStore, getView, invalidview, isPromiseView, isServer, renderApp, renderSSR, viewWillMount, viewWillUnmount} from '@medux/core';
import {createBrowserHistory, createMemoryHistory} from 'history';
import {renderToNodeStream, renderToString} from 'react-dom/server';

import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';
import {withRouter} from 'react-router-dom';

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
    const routerData = router(state, action as any);
    if (storeOptions.routerParser && state !== routerData) {
      return storeOptions.routerParser(routerData, state);
    } else {
      return routerData;
    }
  };
  // SSR需要数据是单向的，store->view，不能store->view->store->view，而view:ConnectedRouter初始化时会触发一次LOCATION_CHANGE
  let routerInited = false;
  const filterRouter = () => (next: Function) => (action: {type: string}) => {
    if (action.type === '@@router/LOCATION_CHANGE') {
      if (!routerInited) {
        routerInited = true;
        return action;
      } else {
        invalidview();
      }
    }
    return next(action);
  };
  storeOptions.middlewares = storeOptions.middlewares || [];
  storeOptions.middlewares.unshift(filterRouter, routerMiddleware(history));

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
  let routerInited = false;
  const filterRouter = () => (next: Function) => (action: {type: string}) => {
    if (action.type === '@@router/LOCATION_CHANGE') {
      if (!routerInited) {
        routerInited = true;
        return action;
      } else {
        invalidview();
      }
    }
    return next(action);
  };
  storeOptions.middlewares = storeOptions.middlewares || [];
  storeOptions.middlewares.unshift(filterRouter, routerMiddleware(history));
  const render = renderToStream ? renderToNodeStream : renderToString;
  return renderSSR(
    (
      store,
      appModel,
      appViews: {
        [key: string]: React.ComponentType;
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

export const loadView: LoadView = (moduleGetter, moduleName, viewName, Loading?: ComponentType<any>) => {
  return function Wrap(props: any) {
    const [view, setView] = useState<{Component: ComponentType} | null>(() => {
      const moduleViewResult = getView<ComponentType>(moduleGetter, moduleName, viewName);
      if (isPromiseView<ComponentType>(moduleViewResult)) {
        moduleViewResult.then(Component => {
          setView({Component});
        });
        return null;
      } else {
        return {Component: moduleViewResult};
      }
    });
    return view ? <view.Component {...props} /> : Loading ? <Loading {...props} /> : null;
  } as any;
};

function exportView<V extends ComponentType>(Component: V, model: Model, viewName: string, Loading?: ComponentType<any>): V {
  if (isServer()) {
    return Component;
  } else {
    const View: FunctionComponent<any> = function View(props: any) {
      const [modelReady, setModelReady] = useState(() => {
        const state = getClientStore().getState();
        const moduleName = model.moduleName;
        model(getClientStore()).then(() => {
          if (!modelReady) {
            setModelReady(true);
          }
        });
        return !!state[moduleName];
      });
      useEffect(() => {
        viewWillMount(model.moduleName, viewName);
        return () => {
          viewWillUnmount(model.moduleName, viewName);
        };
      }, []);
      return modelReady ? <Component {...props} /> : Loading ? <Loading {...props} /> : null;
    };
    View.propTypes = Component.propTypes;
    View.contextTypes = Component.contextTypes;
    View.defaultProps = Component.defaultProps;
    return View as any;
  }
}

export const exportModule: ExportModule<ComponentType<any>> = (moduleName, initState, ActionHandles, views, Loading?: ComponentType<any>) => {
  const data = baseExportModule(moduleName, initState, ActionHandles, views);
  const maps: typeof views = {} as any;
  for (const key in data.views) {
    if (data.views.hasOwnProperty(key)) {
      maps[key] = exportView(data.views[key], data.model, key, Loading);
    }
  }
  data.views = maps;
  return data;
};

export type RootState<G extends ModuleGetter = {}, R = RouterState> = BaseRootState<G> & {router: R};
