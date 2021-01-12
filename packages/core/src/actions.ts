import {ActionTypes, config} from './basic';

/**
 * 框架定义的全局错误ActionCreator，拥有固定的type
 * @param error 错误
 */
export function errorAction(reason: Object) {
  return {
    type: ActionTypes.Error,
    payload: [reason],
  };
}
export function moduleInitAction(moduleName: string, initState: any) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MInit}`,
    payload: [initState],
  };
}
