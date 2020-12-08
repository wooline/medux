import {Middleware, Reducer} from 'redux';
import {CoreModuleHandlers, CoreModuleState, config, reducer} from '@medux/core';
import {deepExtend} from './deep-extend';
import {buildHistoryStack, routeConfig, uriToLocation, locationToUri, extractNativeLocation} from './basic';

import type {LocationTransform} from './transform';
import type {RootParams, Location, NativeLocation, WebNativeLocation, RouteState, HistoryAction, RoutePayload} from './basic';

export {deepExtend} from './deep-extend';
export {createWebLocationTransform} from './transform';
export {PathnameRules, extractPathParams} from './matchPath';
export {setRouteConfig} from './basic';
export type {LocationMap, LocationTransform} from './transform';
export type {RootParams, Location, NativeLocation, WebNativeLocation, RootState, RouteState, HistoryAction, RouteRootState, RoutePayload} from './basic';

interface Store {
  dispatch(action: {type: string}): any;
}
export type RouteModuleState<P extends {[key: string]: any} = {}> = CoreModuleState & P;
export class RouteModuleHandlers<S extends CoreModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
  @reducer
  public Init(initState: S): S {
    const routeParams = this.rootState.route.params[this.moduleName];
    return routeParams ? (deepExtend({}, initState, routeParams) as any) : initState;
  }

  @reducer
  public RouteParams(payload: Partial<S>): S {
    return deepExtend({}, this.state, payload) as any;
  }
}
export const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `medux${config.NSP}RouteChange`,
  BeforeRouteChange: `medux${config.NSP}BeforeRouteChange`,
};

export function beforeRouteChangeAction<P extends RootParams, NL extends NativeLocation>(routeState: RouteState<P, NL>) {
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

export function routeChangeAction<P extends RootParams, NL extends NativeLocation>(routeState: RouteState<P, NL>) {
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
    return action.payload[0];
  }
  return state;
};

export interface NativeHistory<NL extends NativeLocation = WebNativeLocation> {
  getLocation(): NL;
  parseUrl(url: string): NL;
  toUrl(location: NL): string;
  push(location: NL, key: string): void;
  replace(location: NL, key: string): void;
  relaunch(location: NL, key: string): void;
  pop(location: NL, n: number, key: string): void;
}

export abstract class BaseHistoryActions<P extends RootParams, NL extends NativeLocation = WebNativeLocation> {
  private _tid = 0;

  private _routeState: RouteState<P, NL>;

  private _startupUri: string;

  protected store: Store | undefined;

  constructor(protected nativeHistory: NativeHistory<NL>, protected locationTransform: LocationTransform<P, NL>) {
    const location = this.locationTransform.in(nativeHistory.getLocation());
    const key = this._createKey();
    const routeState: RouteState<P, NL> = this.locationToRouteState(location, 'RELAUNCH', key);
    this._routeState = routeState;
    this._startupUri = locationToUri(location, key);
    const nativeLocation = extractNativeLocation(routeState);
    nativeHistory.relaunch(nativeLocation, key);
  }

  getRouteState(): RouteState<P, NL> {
    return this._routeState;
  }

  setStore(_store: Store) {
    this.store = _store;
  }

  // mergeInitState<T extends RouteRootState<P>>(initState: T): RouteRootState<P> {
  //   const routeState = this._routeState;
  //   const data: RouteRootState<P> = {...initState, route: routeState};
  //   Object.keys(routeState.params).forEach((moduleName) => {
  //     if (!data[moduleName]) {
  //       data[moduleName] = {};
  //     }
  //     data[moduleName] = {...data[moduleName], routeParams: routeState.params[moduleName] || {}};
  //   });
  //   return data;
  // }

  protected getCurKey(): string {
    return this._routeState.key;
  }

  private _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  protected findHistoryByKey(key: string): number {
    const {history} = this._routeState;
    return history.findIndex((uri) => uri.startsWith(`${key}${routeConfig.RSP}`));
  }

  payloadToLocation(data: RoutePayload<P> | string): Location<P> {
    if (typeof data === 'string') {
      const nativeLocation = this.nativeHistory.parseUrl(data);
      return this.locationTransform.in(nativeLocation);
    }
    const {tag} = data;
    const extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
    const params: P = extendParams && data.params ? (deepExtend({}, extendParams, data.params) as any) : data.params;
    return {tag: tag || this._routeState.tag || '/', params};
  }

  locationToUrl(data: RoutePayload<P>): string {
    const {tag} = data;
    const extendParams = data.extendParams === true ? this._routeState.params : data.extendParams;
    const params: P = extendParams && data.params ? (deepExtend({}, extendParams, data.params) as any) : data.params;
    const nativeLocation = this.locationTransform.out({tag: tag || this._routeState.tag || '/', params});
    return this.nativeHistory.toUrl(nativeLocation);
  }

  locationToRouteState(location: Location<P>, action: HistoryAction, key: string): RouteState<P, NL> {
    const {history, stack} = buildHistoryStack(location, action, key, this._routeState || {history: [], stack: []});
    const natvieLocation = this.locationTransform.out(location);
    return {...location, action, key, history, stack, ...natvieLocation};
  }

  protected async dispatch(location: Location<P>, action: HistoryAction, key: string = '', callNative?: string | number): Promise<RouteState<P, NL>> {
    key = key || this._createKey();
    const routeState = this.locationToRouteState(location, action, key);
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    await this.store!.dispatch(routeChangeAction(routeState));
    if (callNative) {
      const nativeLocation = extractNativeLocation(routeState);
      if (typeof callNative === 'number') {
        this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative, key);
      } else {
        this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation, key);
      }
    }
    return routeState;
  }

  relaunch(data: RoutePayload<P> | string, disableNative?: boolean): Promise<RouteState<P, NL>> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'RELAUNCH', '', disableNative ? '' : 'relaunch');
  }

  push(data: RoutePayload<P> | string, disableNative?: boolean): Promise<RouteState<P, NL>> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'PUSH', '', disableNative ? '' : 'push');
  }

  replace(data: RoutePayload<P> | string, disableNative?: boolean): Promise<RouteState<P, NL>> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'REPLACE', '', disableNative ? '' : 'replace');
  }

  pop(n = 1, root: 'HOME' | 'FIRST' | '' = 'FIRST', disableNative?: boolean, useStack?: boolean): Promise<RouteState<P, NL>> {
    n = n || 1;
    let uri = useStack ? this._routeState.stack[n] : this._routeState.history[n];
    let k = useStack ? 1000 + n : n;
    if (!uri) {
      k = 1000000;
      if (root === 'HOME') {
        uri = routeConfig.homeUri;
      } else if (root === 'FIRST') {
        uri = this._startupUri;
      } else {
        return Promise.reject(1);
      }
    }
    const {key, location} = uriToLocation<P>(uri);
    return this.dispatch(location, `POP${k}` as any, key, disableNative ? '' : k);
  }

  back(n = 1, root: 'HOME' | 'FIRST' | '' = 'FIRST', disableNative?: boolean): Promise<RouteState<P, NL>> {
    return this.pop(n, root, disableNative, true);
  }

  home(root: 'HOME' | 'FIRST' = 'FIRST', disableNative?: boolean): Promise<RouteState<P, NL>> {
    return this.relaunch(root === 'HOME' ? routeConfig.homeUri : this._startupUri, disableNative);
  }

  abstract destroy(): void;
}
