import {ActionTypes, config} from './basic';

/**
 * 框架定义的全局错误ActionCreator，拥有固定的type
 * @param error 错误
 */
export function errorAction(error: Object) {
  return {
    type: ActionTypes.Error,
    payload: [error],
  };
}
export function moduleInitAction(moduleName: string, initState: any) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MInit}`,
    payload: [initState],
  };
}
export function moduleReInitAction(moduleName: string, initState: any) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MReInit}`,
    payload: [initState],
  };
}
