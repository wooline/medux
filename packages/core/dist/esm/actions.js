import { ActionTypes, config } from './basic';
export function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
export function routeChangeAction(routeState) {
  return {
    type: ActionTypes.RouteChange,
    payload: [routeState]
  };
}
export function routeParamsAction(moduleName, params, action) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MRouteParams,
    payload: [params, action]
  };
}