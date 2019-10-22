import { config } from './basic';
export var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MPreRouteParams: 'PreRouteParams',
  Error: "medux" + config.NSP + "Error",
  RouteChange: "medux" + config.NSP + "RouteChange"
};
export function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: error
  };
}
export function routeChangeAction(route) {
  return {
    type: ActionTypes.RouteChange,
    payload: route
  };
}
export function preRouteParamsAction(moduleName, params) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MPreRouteParams,
    payload: params
  };
}
//# sourceMappingURL=actions.js.map