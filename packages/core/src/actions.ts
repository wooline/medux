import {NSP, RouteState} from './basic';

export const ActionTypes = {
  M_LOADING: 'LOADING',
  M_INIT: 'INIT',
  F_ERROR: `@@framework${NSP}ERROR`,
  // F_VIEW_INVALID: `@@framework${NSP}VIEW_INVALID`,
  F_ROUTE_CHANGE: `@@framework${NSP}ROUTE_CHANGE`,
  F_ROUTE_METHOD: `@@framework${NSP}ROUTE_METHOD`,
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

// export function viewInvalidAction(currentViews: DisplayViews) {
//   return {
//     type: ActionTypes.F_VIEW_INVALID,
//     currentViews,
//   };
// }
