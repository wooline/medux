import { NSP } from './basic';
export const ActionTypes = {
  M_LOADING: 'LOADING',
  M_INIT: 'INIT',
  F_ERROR: "@@framework" + NSP + "ERROR",
  F_VIEW_INVALID: "@@framework" + NSP + "VIEW_INVALID"
};
export function errorAction(error) {
  return {
    type: ActionTypes.F_ERROR,
    error
  };
}
export function viewInvalidAction(currentViews) {
  return {
    type: ActionTypes.F_VIEW_INVALID,
    currentViews
  };
}
//# sourceMappingURL=actions.js.map