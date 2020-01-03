import { config } from './basic';
export var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteParams: 'RouteParams',
  Error: "medux" + config.NSP + "Error",
  RouteChange: "medux" + config.NSP + "RouteChange"
};
export function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
export function routeChangeAction(route) {
  return {
    type: ActionTypes.RouteChange,
    payload: [route]
  };
}
export function routeParamsAction(moduleName, params) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MRouteParams,
    payload: [params]
  };
}
//# sourceMappingURL=actions.js.map