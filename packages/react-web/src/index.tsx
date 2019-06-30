import {RootState as BaseRootState, ModuleGetter, StoreOptions} from '@medux/core/types/export';
import {ConnectedRouter, RouterState, connectRouter, routerMiddleware} from 'connected-react-router';
import React, {ReactElement} from 'react';
import {createBrowserHistory, createMemoryHistory} from 'history';
import {renderApp, renderSSR} from '@medux/react';
import {renderToNodeStream, renderToString} from 'react-dom/server';

import ReactDOM from 'react-dom';
import {invalidview} from '@medux/core';
import {withRouter} from 'react-router-dom';

export {routerActions} from 'connected-react-router';
export {loadView, exportModule} from '@medux/react';

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
    (Provider, AppMainView, ssrInitStoreKey) => {
      const WithRouter = withRouter(AppMainView);
      const app = (
        <Provider>
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
    (Provider, AppMainView) => {
      return render(
        <Provider>
          <ConnectedRouter history={history}>
            <AppMainView />
          </ConnectedRouter>
        </Provider>
      );
    },
    moduleGetter,
    appModuleName,
    storeOptions
  );
}

export type RootState<G extends ModuleGetter, R = RouterState> = BaseRootState<G> & {router: R};
