import {Middleware, Reducer} from 'redux';
import {CoreModuleHandlers, CoreModuleState, config, reducer, deepMerge, deepMergeState, mergeState} from '@medux/core';
import {uriToLocation, extractNativeLocation, History} from './basic';

import type {LocationTransform} from './transform';
import type {RootParams, Location, NativeLocation, RouteState, HistoryAction, RoutePayload} from './basic';

export {PathnameRules, extractPathParams} from './matchPath';
export {setRouteConfig} from './basic';
export {PagenameMap, createLocationTransform, createPathnameTransform} from './transform';
export type {LocationTransform, PathnameTransform} from './transform';
export type {RootParams, Location, NativeLocation, RootState, RouteState, HistoryAction, RouteRootState, RoutePayload, DeepPartial} from './basic';

interface Store {
  dispatch(action: {type: string}): any;
}
export type RouteModuleState<P extends {[key: string]: any} = {}> = CoreModuleState & P;
export class RouteModuleHandlers<S extends CoreModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
  @reducer
  public Init(initState: S): S {
    const routeParams = this.rootState.route.params[this.moduleName];
    return routeParams ? (deepMergeState(initState, routeParams) as any) : initState;
  }

  @reducer
  public RouteParams(payload: Partial<S>): S {
    return deepMergeState(this.state, payload) as any;
  }
}
export const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `medux${config.NSP}RouteChange`,
  BeforeRouteChange: `medux${config.NSP}BeforeRouteChange`,
};

export function beforeRouteChangeAction<P extends {[key: string]: any}, NL extends NativeLocation>(routeState: RouteState<P, NL>) {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState],
  };
}

export function routeParamsAction(moduleName: string, params: any, action: HistoryAction) {
  return {
    type: `${moduleName}${config.NSP}${RouteActionTypes.MRouteParams}`,
    payload: [params, action],
  };
}

export function routeChangeAction<P extends {[key: string]: any}, NL extends NativeLocation>(routeState: RouteState<P, NL>) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState],
  };
}

export const routeMiddleware: Middleware = ({dispatch, getState}) => (next) => (action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    const routeState: RouteState<any, any> = action.payload[0];
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
  }
  return next(action);
};
export const routeReducer: Reducer = (state: RouteState<any, any>, action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    return mergeState(state, action.payload[0]);
  }
  return state;
};

export interface NativeRouter<NL extends NativeLocation = NativeLocation> {
  parseUrl(url: string): NL;
  toUrl(location: NL): string;
  push(location: NL, key: string): void;
  replace(location: NL, key: string): void;
  relaunch(location: NL, key: string): void;
  back(location: NL, n: number, key: string): void;
  pop(location: NL, n: number, key: string): void;
}

export abstract class BaseRouter<P extends RootParams, NL extends NativeLocation = NativeLocation> {
  private _tid = 0;

  private _routeState: RouteState<P, NL>;

  protected store: Store | undefined;

  public readonly history: History;

  constructor(initLocation: NL, protected nativeRouter: NativeRouter<NL>, protected locationTransform: LocationTransform<P, NL>) {
    const location = this.locationTransform.in(initLocation);
    const key = this._createKey();
    this.history = new History();
    const routeState: RouteState<P, NL> = this.locationToRouteState(location, 'RELAUNCH', key);
    this._routeState = routeState;
    this.history.relaunch(location, key);
    const nativeLocation = extractNativeLocation(routeState);
    nativeRouter.relaunch(nativeLocation, key);
  }

  getRouteState(): RouteState<P, NL> {
    return this._routeState;
  }

  setStore(_store: Store) {
    this.store = _store;
  }

  protected getCurKey(): string {
    return this._routeState.key;
  }

  private _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  payloadToLocation(data: RoutePayload<P> | string): Location<P> {
    if (typeof data === 'string') {
      const nativeLocation = this.nativeRouter.parseUrl(data);
      return this.locationTransform.in(nativeLocation);
    }
    const {pagename} = data;
    const extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
    const params: P = extendParams && data.params ? (deepMerge({}, extendParams, data.params) as any) : data.params;
    return {pagename: pagename || this._routeState.pagename || '/', params};
  }

  locationToUrl(data: RoutePayload<P>): string {
    const {pagename} = data;
    const extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
    const params: P = extendParams && data.params ? (deepMerge({}, extendParams, data.params) as any) : data.params;
    const nativeLocation = this.locationTransform.out({pagename: pagename || this._routeState.pagename || '/', params});
    return this.nativeRouter.toUrl(nativeLocation);
  }

  locationToRouteState(location: Location<P>, action: HistoryAction, key: string): RouteState<P, NL> {
    const natvieLocation = this.locationTransform.out(location);
    return {...location, action, key, ...natvieLocation};
  }

  async relaunch(data: RoutePayload<P> | string, internal?: boolean): Promise<RouteState<P, NL>> {
    const paLocation = this.payloadToLocation(data);
    const key = this._createKey();
    const routeState = this.locationToRouteState(paLocation, 'RELAUNCH', key);
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(paLocation, key);
    } else {
      this.history.relaunch(paLocation, key);
      const nativeLocation = extractNativeLocation(routeState);
      this.nativeRouter.relaunch(nativeLocation, key);
    }
    return routeState;
  }

  async push(data: RoutePayload<P> | string, internal?: boolean): Promise<RouteState<P, NL>> {
    const paLocation = this.payloadToLocation(data);
    const key = this._createKey();
    const routeState = this.locationToRouteState(paLocation, 'PUSH', key);
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().push(paLocation, key);
    } else {
      this.history.push(paLocation, key);
      const nativeLocation = extractNativeLocation(routeState);
      this.nativeRouter.push(nativeLocation, key);
    }
    return routeState;
  }

  async replace(data: RoutePayload<P> | string, internal?: boolean): Promise<RouteState<P, NL>> {
    const paLocation = this.payloadToLocation(data);
    const key = this._createKey();
    const routeState = this.locationToRouteState(paLocation, 'REPLACE', key);
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().replace(paLocation, key);
    } else {
      this.history.replace(paLocation, key);
      const nativeLocation = extractNativeLocation(routeState);
      this.nativeRouter.replace(nativeLocation, key);
    }

    return routeState;
  }

  async back(n: number = 1, internal?: boolean): Promise<RouteState<P, NL>> {
    const stack = internal ? this.history.getCurrentInternalHistory().getActionRecord(n) : this.history.getActionRecord(n);
    if (!stack) {
      return Promise.reject(1);
    }
    const uri = stack.uri;
    const {key, location: paLocation} = uriToLocation<P>(uri);
    const routeState = this.locationToRouteState(paLocation, 'BACK', key);
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
      const nativeLocation = extractNativeLocation(routeState);
      this.nativeRouter.back(nativeLocation, n, key);
    }
    return routeState;
  }

  async pop(n: number = 1, internal?: boolean): Promise<RouteState<P, NL>> {
    const stack = internal ? this.history.getCurrentInternalHistory().getPageRecord(n) : this.history.getPageRecord(n);
    if (!stack) {
      return Promise.reject(1);
    }
    const uri = stack.uri;
    const {key, location: paLocation} = uriToLocation<P>(uri);
    const routeState = this.locationToRouteState(paLocation, 'POP', key);
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().pop(n);
    } else {
      this.history.pop(n);
      const nativeLocation = extractNativeLocation(routeState);
      this.nativeRouter.pop(nativeLocation, n, key);
    }
    return routeState;
  }

  abstract destroy(): void;
}
