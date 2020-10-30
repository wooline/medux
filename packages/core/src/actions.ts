import {ActionTypes, RouteState, config} from './basic';

/**
 * 框架定义的全局错误ActionCreator，拥有固定的type
 * @param error 错误
 */
export function errorAction(error: any) {
  return {
    type: ActionTypes.Error,
    payload: [error],
  };
}
/**
 * 框架定义的全局路由切换ActionCreator，拥有固定的type
 * @param route 路由数据
 */
export function routeChangeAction(routeState: RouteState) {
  return {
    type: ActionTypes.RouteChange,
    payload: [routeState],
  };
}
/**
 * 当路由发生变化时，通过该action触发相关模块的状态发生变化
 * @param moduleName 模块名称
 * @param params 存放在路由上的数据
 */
export function routeParamsAction(moduleName: string, params: any, action?: string) {
  return {
    type: `${moduleName}${config.NSP}${ActionTypes.MRouteParams}`,
    payload: [params, action],
  };
}
