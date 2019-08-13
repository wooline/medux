import { config } from './basic';
export const ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
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
//# sourceMappingURL=actions.js.map