import './env';
import { ActionTypes, exportModule as baseExportModule, renderApp } from '@medux/core';
import { createRouter } from './history';
import { setRouteConfig } from '@medux/route-plan-a';
export const exportModule = baseExportModule;
let historyActions = undefined;
let transformRoute = undefined;
let toBrowserUrl = undefined;

function checkRedirect(views) {
  if (views['@']) {
    const url = Object.keys(views['@'])[0];
    historyActions.navigateTo(url);
    return true;
  }

  return false;
}

const redirectMiddleware = () => next => action => {
  if (action.type === ActionTypes.RouteChange) {
    const routeState = action.payload[0];
    const {
      views
    } = routeState.data;

    if (checkRedirect(views)) {
      return;
    }
  }

  return next(action);
};

export function initApp({
  startupUrl,
  moduleGetter,
  appModule,
  routeConfig = {},
  locationMap,
  defaultRouteParams,
  storeOptions = {}
}) {
  setRouteConfig({
    defaultRouteParams
  });
  const router = createRouter(routeConfig, startupUrl, locationMap);
  historyActions = router.historyActions;
  toBrowserUrl = router.toBrowserUrl;
  transformRoute = router.transformRoute;

  if (!storeOptions.middlewares) {
    storeOptions.middlewares = [];
  }

  storeOptions.middlewares.unshift(redirectMiddleware);
  let reduxStore = undefined;
  renderApp(() => {
    return () => void 0;
  }, moduleGetter, appModule, router.historyProxy, storeOptions, store => {
    const storeState = store.getState();
    const {
      views
    } = storeState.route.data;
    checkRedirect(views);
    reduxStore = store;
    return store;
  });
  return {
    store: reduxStore,
    historyActions: historyActions,
    toBrowserUrl: toBrowserUrl,
    transformRoute: transformRoute
  };
}