import {RouteState, config} from './basic';

export const ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MPreRouteParams: 'PreRouteParams',
  Error: `medux${config.NSP}Error`,
  RouteChange: `medux${config.NSP}RouteChange`,
};

export function errorAction(error: any) {
  return {
    type: ActionTypes.Error,
    payload: error,
  };
}

export function routeChangeAction(route: RouteState) {
  return {
    type: ActionTypes.RouteChange,
    payload: route,
  };
}

export function preRouteParamsAction(moduleName: string, params: any) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MPreRouteParams}`,
    payload: params,
  };
}
