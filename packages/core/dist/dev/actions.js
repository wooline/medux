import { NSP } from './basic';
export var ActionTypes = {
  M_LOADING: 'LOADING',
  M_INIT: 'INIT',
  F_ERROR: "@@framework" + NSP + "ERROR",
  F_ROUTE_CHANGE: "@@framework" + NSP + "ROUTE_CHANGE",
  F_ROUTE_COMPLETE: "@@framework" + NSP + "ROUTE_COMPLETE"
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
export function routeCompleteAction() {
  return {
    type: ActionTypes.F_ROUTE_COMPLETE
  };
} // export function viewInvalidAction(currentViews: DisplayViews) {
//   return {
//     type: ActionTypes.F_VIEW_INVALID,
//     currentViews,
//   };
// }
//# sourceMappingURL=actions.js.map