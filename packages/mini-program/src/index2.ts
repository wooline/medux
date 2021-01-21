import './env';

import {
  ActionTypes,
  RootState as BaseRootState,
  CommonModule,
  DisplayViews,
  ExportModule,
  ModuleGetter,
  RouteState,
  StoreOptions,
  StoreState,
  exportModule as baseExportModule,
  renderApp,
} from '@medux/core';
import {HistoryActions, ToBrowserUrl, createRouter} from './history';
import {MeduxLocation, TransformRoute, setRouteConfig} from '@medux/route-plan-a';
import {Middleware, Store} from 'redux';

export type {RouteConfig} from '@medux/route-plan-a';
export type {LocationMap} from './history';

export type RootState<G extends ModuleGetter> = BaseRootState<G, MeduxLocation>;
export type BrowserRouter<Params> = {transformRoute: TransformRoute; historyActions: HistoryActions<Params>; toUrl: ToBrowserUrl<Params>};
export const exportModule: ExportModule<any> = baseExportModule;

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
export interface InitAppOptions {
  startupUrl: string;
  moduleGetter: ModuleGetter;
  appModule: CommonModule;
  appViewName?: string;
  routeConfig?: import('@medux/route-plan-a').RouteConfig;
  locationMap?: import('./history').LocationMap;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
}
export function initApp({startupUrl, moduleGetter, appModule, appViewName = 'main', routeConfig = {}, locationMap, defaultRouteParams, storeOptions = {}}: InitAppOptions) {
  setRouteConfig({defaultRouteParams});
  const router = createRouter(routeConfig, startupUrl, locationMap);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }
  storeOptions.middlewares.unshift(redirectMiddleware);
  let reduxStore: Store | undefined = undefined;
  renderApp(
    () => {
      return () => void 0;
    },
    moduleGetter,
    appModule,
    appViewName,
    router.historyProxy,
    storeOptions,
    (store: Store<StoreState>) => {
      const storeState = store.getState();
      const {views} = storeState.route.data;
      checkRedirect(views);
      reduxStore = store;
      return store;
    }
  );
  return {store: reduxStore!, historyActions: historyActions!, toBrowserUrl: toBrowserUrl!, transformRoute: transformRoute!};
}
