import './env';
import {Store, Middleware} from 'redux';

import {exportModule as baseExportModule, ExportModule, RootState as BaseRootState, RouteState, ModuleGetter, StoreOptions, StoreState, ActionTypes, DisplayViews, renderApp} from '@medux/core';
import {TransformRoute, MeduxLocation, setRouteConfig} from '@medux/route-plan-a';
import {HistoryActions, createRouter, ToBrowserUrl} from './history';
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
} from '@medux/core';
export {setRouteConfig} from '@medux/route-plan-a';

export type {Actions, RouteData, RouteViews, BaseModelState} from '@medux/core';

export type {RouteConfig} from '@medux/route-plan-a';
export type {LocationMap} from './history';

let historyActions: HistoryActions | undefined = undefined;
let transformRoute: TransformRoute | undefined = undefined;
let toBrowserUrl: ToBrowserUrl | undefined = undefined;

function checkRedirect(views: DisplayViews): boolean {
  if (views['@']) {
    const url = Object.keys(views['@'])[0];
    historyActions!.navigateTo(url);
    return true;
  }
  return false;
}
const redirectMiddleware: Middleware = () => (next) => (action) => {
  if (action.type === ActionTypes.RouteChange) {
    const routeState: RouteState = action.payload[0];
    const {views} = routeState.data;
    if (checkRedirect(views)) {
      return;
    }
  }
  return next(action);
};

export function buildApp({
  moduleGetter,
  appModuleName,
  routeConfig = {},
  locationMap,
  defaultRouteParams,
  storeOptions = {},
  beforeRender,
}: {
  moduleGetter: ModuleGetter;
  appModuleName: string;
  routeConfig?: import('@medux/route-plan-a').RouteConfig;
  locationMap?: import('./history').LocationMap;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
  beforeRender?: (data: {store: Store<StoreState>; historyActions: HistoryActions; toBrowserUrl: ToBrowserUrl; transformRoute: TransformRoute}) => Store<StoreState>;
}) {
  setRouteConfig({defaultRouteParams});
  const router = createRouter(routeConfig, locationMap);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }
  storeOptions.middlewares.unshift(redirectMiddleware);
  return renderApp(
    () => {
      return () => void 0;
    },
    moduleGetter,
    appModuleName,
    router.historyProxy,
    storeOptions,
    (store: Store<StoreState>) => {
      const storeState = store.getState();
      const {views} = storeState.route.data;
      checkRedirect(views);
      return beforeRender ? beforeRender({store, historyActions: historyActions!, toBrowserUrl: toBrowserUrl!, transformRoute: transformRoute!}) : store;
    }
  );
}
export type RootState<G extends ModuleGetter> = BaseRootState<G, MeduxLocation>;
export type BrowserRouter<Params> = {transformRoute: TransformRoute; historyActions: HistoryActions<Params>; toUrl: ToBrowserUrl<Params>};
export const exportModule: ExportModule<{__moduleName?: string}> = (moduleName, initState, ActionHandles, views) => {
  Object.keys(views).forEach((key) => {
    views[key].__moduleName = moduleName;
  });
  return baseExportModule(moduleName, initState, ActionHandles, views);
};
export interface DispatchProp {
  dispatch?: (action: {type: string}) => any;
}
