import {
  CoreModuleHandlers,
  CoreModuleState,
  ControllerMiddleware,
  config,
  reducer,
  deepMerge,
  mergeState,
  deepMergeState,
  IStore,
  CommonModule,
  IModuleHandlers,
  exportModule,
} from '@medux/core';
import {createLocationTransform, LocationTransform} from './transform';
import type {RootParams, RouteState, HistoryAction} from './basic';
import type {PagenameMap, NativeLocationMap} from './transform';

export class ModuleWithRouteHandlers<S extends CoreModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
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
export function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>) {
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
export function routeChangeAction<P extends RootParams>(routeState: RouteState<P>) {
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

interface IRouteModuleHandlers<P extends RootParams = {}> extends IModuleHandlers {
  initState: RouteState<P>;
}

class RouteModuleHandlers implements IRouteModuleHandlers {
  initState!: RouteState;

  moduleName!: string;

  store!: IStore<any>;

  actions!: {};

  protected get state(): RouteState {
    return this.store.getState(this.moduleName) as RouteState;
  }

  RouteChange(routeState: RouteState) {
    return mergeState(this.state, routeState);
  }
}

export type RouteModule = CommonModule & {locationTransform: LocationTransform<any>};

export function createRouteModule<P extends RootParams, G extends PagenameMap<P>>(
  defaultParams: P,
  pagenameMap: G,
  nativeLocationMap: NativeLocationMap,
  notfoundPagename: string = '/404',
  paramsKey: string = '_'
) {
  const handlers: {new (): IRouteModuleHandlers<P>} = RouteModuleHandlers as any;
  const locationTransform = createLocationTransform(defaultParams, pagenameMap, nativeLocationMap, notfoundPagename, paramsKey);
  const result = exportModule('route', handlers, {});
  return {
    default: result,
    locationTransform,
  };
}
