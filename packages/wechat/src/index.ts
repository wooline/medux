import './env';

import {env} from '@medux/core';
import {initApp, InitAppOptions} from '@medux/mini-program';
export {connectComponent} from './connectComponent';
export {connectPage} from './connectPage';
export {
  ActionTypes,
  delayPromise,
  client,
  env,
  isDevelopmentEnv,
  LoadingState,
  exportActions,
  BaseModelHandlers,
  modelHotReplacement,
  effect,
  errorAction,
  reducer,
  viewHotReplacement,
  setLoading,
  setConfig,
  logger,
  setLoadingDepthTime,
} from '@medux/core';

export type {Actions, RouteData, RouteViews, BaseModelState} from '@medux/core';

export type {RouteConfig, LocationMap, RootState, BrowserRouter} from '@medux/mini-program';
export {exportModule} from '@medux/mini-program';

export interface DispatchProp {
  dispatch?: (action: {type: string}) => any;
}

function toUrl(pathname: string, query: {[key: string]: string}) {
  pathname = ('/' + pathname).replace('//', '/');
  let search = Object.keys(query)
    .map((key) => key + '=' + query[key])
    .join('&');
  if (search) {
    search = '?' + search;
  }
  return {pathname, search};
}
export function buildApp(options: Omit<InitAppOptions, 'startupUrl'>) {
  const {path, query} = env.getLaunchOptionsSync();
  const {pathname, search} = toUrl(path, query);

  const result = initApp({...options, startupUrl: pathname + search});
  env.onAppRoute(function (res) {
    const {pathname, search} = toUrl(res.path, res.query);
    result.historyActions.passive({pathname, search, hash: '', action: 'PUSH'});
  });
  return result;
}
