import {ActionTypes, RouteState, config} from './basic';

export function errorAction(error: any) {
  return {
    type: ActionTypes.Error,
    payload: [error],
  };
}

export function routeChangeAction(route: RouteState) {
  return {
    type: ActionTypes.RouteChange,
    payload: [route],
  };
}

export function routeParamsAction(moduleName: string, params: any) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MRouteParams}`,
    payload: [params],
  };
}
