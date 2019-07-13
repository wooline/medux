import {NSP, RouteState} from './basic';

export const ActionTypes = {
  M_LOADING: 'LOADING',
  M_INIT: 'INIT',
  F_ERROR: `@@framework${NSP}ERROR`,
  F_ROUTE_CHANGE: `@@framework${NSP}ROUTE_CHANGE`,
};

export function errorAction(error: any) {
  return {
    type: ActionTypes.F_ERROR,
    payload: error,
  };
}

export function routeChangeAction(route: RouteState) {
  return {
    type: ActionTypes.F_ROUTE_CHANGE,
    payload: route,
  };
}
