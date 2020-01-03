import {RouteState, config} from './basic';

export const ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteParams: 'RouteParams',
  Error: `medux${config.NSP}Error`,
  RouteChange: `medux${config.NSP}RouteChange`,
};

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
