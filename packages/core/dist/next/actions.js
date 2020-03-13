import { ActionTypes, config } from './basic';
export function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
export function routeChangeAction(route) {
  return {
    type: ActionTypes.RouteChange,
    payload: [route]
  };
}
export function routeParamsAction(moduleName, params) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MRouteParams}`,
    payload: [params]
  };
}