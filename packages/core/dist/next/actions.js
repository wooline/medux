import { ActionTypes, config } from './basic';
export function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
export function moduleInitAction(moduleName, initState) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MInit}`,
    payload: [initState]
  };
}
export function moduleReInitAction(moduleName, initState) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MReInit}`,
    payload: [initState]
  };
}