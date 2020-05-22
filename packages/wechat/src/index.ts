import {Store, Middleware, Dispatch} from 'redux';

import {exportModule as baseExportModule, ExportModule, RootState as BaseRootState, RouteState, ModuleGetter, StoreOptions, StoreState, ActionTypes, DisplayViews, renderApp} from '@medux/core';
import {TransformRoute, MeduxLocation, setRouteConfig} from '@medux/route-plan-a';
import {HistoryActions, createRouter, ToBrowserUrl} from './history';
import {env} from './env';
export {connectView} from './connectView';
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
  defaultRouteParams,
  storeOptions = {},
  beforeRender,
}: {
  moduleGetter: ModuleGetter;
  appModuleName: string;
  routeConfig?: import('@medux/route-plan-a').RouteConfig;
  defaultRouteParams?: {[moduleName: string]: any};
  storeOptions?: StoreOptions;
  beforeRender?: (data: {store: Store<StoreState>; historyActions: HistoryActions; toBrowserUrl: ToBrowserUrl; transformRoute: TransformRoute}) => Store<StoreState>;
}) {
  setRouteConfig({defaultRouteParams});
  const router = createRouter(routeConfig);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;
  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }
  storeOptions.middlewares.unshift(redirectMiddleware);
  return renderApp(
    () => {
      env.console.log('renderer....');
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
export const exportModule: ExportModule<{}> = baseExportModule;
export interface DispatchProp {
  dispatch: Dispatch;
}
