import { ActionTypes, config } from './basic';
export function errorAction(reason) {
  return {
    type: ActionTypes.Error,
    payload: [reason]
  };
}
export function moduleInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MInit,
    payload: [initState]
  };
}