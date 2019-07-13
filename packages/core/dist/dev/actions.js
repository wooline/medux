import { NSP } from './basic';
export var ActionTypes = {
  M_LOADING: 'LOADING',
  M_INIT: 'INIT',
  F_ERROR: "@@framework" + NSP + "ERROR",
  F_ROUTE_CHANGE: "@@framework" + NSP + "ROUTE_CHANGE"
};
export function errorAction(error) {
  return {
    type: ActionTypes.F_ERROR,
    payload: error
  };
}
export function routeChangeAction(route) {
  return {
    type: ActionTypes.F_ROUTE_CHANGE,
    payload: route
  };
}
//# sourceMappingURL=actions.js.map