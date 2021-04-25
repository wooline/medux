import {
  CoreModuleHandlers,
  CoreModuleState,
  ControllerMiddleware,
  config,
  reducer,
  deepMerge,
  mergeState,
  deepMergeState,
  IController,
  IModuleHandlers,
} from '@medux/core';
import type {RouteState, HistoryAction} from './basic';

export class RouteModuleHandlers<S extends CoreModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
  @reducer
  public Init(initState: S): S {
    const routeParams = this.rootState.route.params[this.moduleName];
    return routeParams ? (deepMerge({}, initState, routeParams) as any) : initState;
  }

  @reducer
  public RouteParams(payload: Partial<S>): S {
    return deepMergeState(this.state, payload) as S;
  }
}
export const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `route${config.NSP}RouteChange`,
  TestRouteChange: `route${config.NSP}TestRouteChange`,
};
export function testRouteChangeAction<P extends {[key: string]: any}>(routeState: RouteState<P>) {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState],
  };
}
export function routeParamsAction(moduleName: string, params: any, action: HistoryAction) {
  return {
    type: `${moduleName}${config.NSP}${RouteActionTypes.MRouteParams}`,
    payload: [params, action],
  };
}
export function routeChangeAction<P extends {[key: string]: any}>(routeState: RouteState<P>) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState],
  };
}
export const routeMiddleware: ControllerMiddleware = ({dispatch, getState}) => (next) => (action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    const result = next(action);
    const routeState: RouteState<any> = action.payload![0];
    const rootRouteParams = routeState.params;
    const rootState = getState();
    Object.keys(rootRouteParams).forEach((moduleName) => {
      const routeParams = rootRouteParams[moduleName];
      if (routeParams) {
        if (rootState[moduleName]?.initialized) {
          dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
        }
      }
    });
    return result;
  }
  return next(action);
};
// export type RouteModuleState<P extends {[key: string]: any} = {}> = CoreModuleState & P;

export class RouteHandlers<P extends {[key: string]: any} = {}> implements IModuleHandlers {
  initState!: RouteState<P>;

  moduleName!: string;

  controller!: IController;

  actions!: {};

  protected get state(): RouteState<P> {
    return this.controller.getState()[this.moduleName];
  }

  RouteChange(routeState: RouteState<P>) {
    return mergeState(this.state, routeState);
  }
}
