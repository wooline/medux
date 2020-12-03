import {Middleware, Reducer} from 'redux';
import {CoreModuleHandlers, CoreModuleState, config, reducer} from '@medux/core';
import assignDeep from './deep-extend';
import {buildHistoryStack, routeConfig, uriToLocation, locationToUri} from './basic';
import {createLocationTransform} from './transform';

import type {LocationTransform} from './transform';
import type {Params, Location, NativeLocation, RouteState, HistoryAction, RoutePayload} from './basic';

export {createLocationTransform} from './transform';
export {setRouteConfig} from './basic';
export type {LocationMap, LocationTransform} from './transform';
export type {Params, Location, NativeLocation, RootState, RouteState, HistoryAction, RouteRootState, RoutePayload} from './basic';

interface Store {
  dispatch(action: {type: string}): any;
}
export type RouteModuleState<P extends {[key: string]: any} = {}> = CoreModuleState & P;
export class RouteModuleHandlers<S extends CoreModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
  @reducer
  public Init(initState: S): S {
    const routeParams = this.rootState.route.params[this.moduleName];
    return routeParams ? {...initState, ...routeParams} : initState;
  }

  @reducer
  public RouteParams(payload: Partial<S>): S {
    return {
      ...this.state,
      ...payload,
    };
  }
}
export const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `medux${config.NSP}RouteChange`,
  BeforeRouteChange: `medux${config.NSP}BeforeRouteChange`,
};

export function beforeRouteChangeAction(routeState: RouteState) {
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

export function routeChangeAction(routeState: RouteState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState],
  };
}

export const routeMiddleware: Middleware = ({dispatch, getState}) => (next) => (action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    const routeState: RouteState = action.payload[0];
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
export const routeReducer: Reducer = (state: RouteState, action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    return action.payload[0];
  }
  return state;
};

export interface NativeHistory {
  getLocation(): NativeLocation;
  parseUrl(url: string): NativeLocation;
  toUrl(location: NativeLocation): string;
  push(location: NativeLocation, key: string): void;
  replace(location: NativeLocation, key: string): void;
  relaunch(location: NativeLocation, key: string): void;
  pop(location: NativeLocation, n: number, key: string): void;
}

export abstract class BaseHistoryActions<P extends Params = Params> {
  private _tid = 0;

  private _routeState: RouteState<P>;

  private _startupUri: string;

  protected locationTransform: LocationTransform<P>;

  protected store: Store | undefined;

  constructor(protected nativeHistory: NativeHistory, locationTransform?: LocationTransform<P>) {
    this.locationTransform = locationTransform || createLocationTransform();
    const location = this.locationTransform.in(nativeHistory.getLocation());
    const key = this._createKey();
    const routeState: RouteState<P> = this.locationToRouteState(location, 'RELAUNCH', key);
    this._routeState = routeState;
    this._startupUri = locationToUri(location, key);
    nativeHistory.relaunch(this.locationTransform.out(location), key);
  }

  getRouteState(): RouteState<P> {
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
      const nativeLocation: NativeLocation = this.nativeHistory.parseUrl(data);
      return this.locationTransform.in(nativeLocation);
    }
    const {tag = '/', extendParams} = data;
    const params: P = assignDeep({}, extendParams === true ? this._routeState.params : extendParams, data.params);
    return {tag, params};
  }

  locationToUrl(data: RoutePayload<P>): string {
    const {tag = '', extendParams} = data;
    const params: P = assignDeep({}, extendParams === true ? this._routeState.params : extendParams, data.params);
    const nativeLocation = this.locationTransform.out({tag, params});
    return this.nativeHistory.toUrl(nativeLocation);
  }

  locationToRouteState(location: Location<P>, action: HistoryAction, key: string): RouteState<P> {
    const {history, stack} = buildHistoryStack(location, action, key, this._routeState || {history: [], stack: []});
    const natvieLocation = this.locationTransform.out(location);
    return {...location, action, key, history, stack, ...natvieLocation};
  }

  protected async dispatch(location: Location<P>, action: HistoryAction, key: string = '', callNative?: string | number): Promise<RouteState<P>> {
    key = key || this._createKey();
    const routeState = this.locationToRouteState(location, action, key);
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    await this.store!.dispatch(routeChangeAction(routeState));
    if (callNative) {
      const nativeLocation = this.locationTransform.out(location);
      if (typeof callNative === 'number') {
        this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative, key);
      } else {
        this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation, key);
      }
    }
    return routeState;
  }

  relaunch(data: RoutePayload<P> | string, disableNative?: boolean): Promise<RouteState<P>> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'RELAUNCH', '', disableNative ? '' : 'relaunch');
  }

  push(data: RoutePayload<P> | string, disableNative?: boolean): Promise<RouteState<P>> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'PUSH', '', disableNative ? '' : 'push');
  }

  replace(data: RoutePayload<P> | string, disableNative?: boolean): Promise<RouteState<P>> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'REPLACE', '', disableNative ? '' : 'replace');
  }

  pop(n = 1, root: 'HOME' | 'FIRST' | '' = 'FIRST', disableNative?: boolean, useStack?: boolean): Promise<RouteState<P>> {
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

  back(n = 1, root: 'HOME' | 'FIRST' | '' = 'FIRST', disableNative?: boolean): Promise<RouteState<P>> {
    return this.pop(n, root, disableNative, true);
  }

  home(root: 'HOME' | 'FIRST' = 'FIRST', disableNative?: boolean): Promise<RouteState<P>> {
    return this.relaunch(root === 'HOME' ? routeConfig.homeUri : this._startupUri, disableNative);
  }

  abstract destroy(): void;
}
