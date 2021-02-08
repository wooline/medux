import {Middleware, Reducer} from 'redux';
import {CoreModuleHandlers, CoreModuleState, config, reducer, deepMergeState, mergeState, env, deepMerge} from '@medux/core';
import {uriToLocation, History} from './basic';

import type {LocationTransform} from './transform';
import type {RootParams, Location, NativeLocation, RouteState, HistoryAction, PayloadLocation, PartialLocation} from './basic';

export {setRouteConfig, routeConfig} from './basic';
export {PagenameMap, createLocationTransform} from './transform';
export type {LocationTransform} from './transform';
export type {RootParams, Location, NativeLocation, RootState, RouteState, HistoryAction, RouteRootState, DeepPartial, PayloadLocation} from './basic';

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

export function beforeRouteChangeAction<P extends {[key: string]: any}>(routeState: RouteState<P>) {
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

export function routeChangeAction<P extends {[key: string]: any}>(routeState: RouteState<P>) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState],
  };
}

export const routeMiddleware: Middleware = ({dispatch, getState}) => (next) => (action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    const routeState: RouteState<any> = action.payload[0];
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
export const routeReducer: Reducer = (state: RouteState<any>, action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    return mergeState(state, action.payload[0]);
  }
  return state;
};

export interface NativeRouter {
  push(getNativeUrl: () => string, key: string, internal: boolean): void;
  replace(getNativeUrl: () => string, key: string, internal: boolean): void;
  relaunch(getNativeUrl: () => string, key: string, internal: boolean): void;
  back(getNativeUrl: () => string, n: number, key: string, internal: boolean): void;
  pop(getNativeUrl: () => string, n: number, key: string, internal: boolean): void;
}

export abstract class BaseRouter<P extends RootParams, N extends string> {
  private _tid = 0;

  private _nativeData: {nativeLocation: NativeLocation; nativeUrl: string} | undefined;

  private _getNativeUrl: () => string = this.getNativeUrl.bind(this);

  private routeState: RouteState<P>;

  private url: string;

  protected store: Store | undefined;

  public readonly history: History;

  constructor(nativeUrl: string, public nativeRouter: NativeRouter, protected locationTransform: LocationTransform<P>) {
    const location = this.urlToLocation(nativeUrl);
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
    this.routeState = routeState;
    this.url = this.locationToUrl(routeState);
    this._nativeData = undefined;
    this.history = new History();
    this.history.relaunch(location, key);
    this.nativeRouter.relaunch(this._getNativeUrl, key, false);
  }

  getRouteState(): RouteState<P> {
    return this.routeState;
  }

  getPagename() {
    return this.routeState.pagename;
  }

  getParams() {
    return this.routeState.params;
  }

  getUrl() {
    return this.url;
  }

  getNativeLocation() {
    if (!this._nativeData) {
      const nativeLocation = this.locationTransform.out(this.routeState);
      const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {nativeLocation, nativeUrl};
    }
    return this._nativeData.nativeLocation;
  }

  getNativeUrl() {
    if (!this._nativeData) {
      const nativeLocation = this.locationTransform.out(this.routeState);
      const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {nativeLocation, nativeUrl};
    }
    return this._nativeData.nativeUrl;
  }

  setStore(_store: Store) {
    this.store = _store;
  }

  protected getCurKey(): string {
    return this.routeState.key;
  }

  private _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  nativeUrlToNativeLocation(url: string): NativeLocation {
    if (!url) {
      return {
        pathname: '/',
        search: '',
        hash: '',
      };
    }
    const arr = url.split(/[?#]/);
    if (arr.length === 2 && url.indexOf('?') < 0) {
      arr.splice(1, 0, '');
    }
    const [path, search = '', hash = ''] = arr;

    return {
      pathname: `/${path.replace(/^\/+|\/+$/g, '')}`,
      search,
      hash,
    };
  }

  urlToLocation(url: string): Location<P> {
    const [pathname, ...others] = url.split('?');
    const query = others.join('?');
    let location: Location<P>;
    try {
      if (query.startsWith('{')) {
        const data = JSON.parse(query);
        location = this.locationTransform.in({pagename: pathname as N, params: data});
      } else {
        const nativeLocation = this.nativeUrlToNativeLocation(url);
        location = this.locationTransform.in(nativeLocation);
      }
    } catch (error) {
      env.console.warn(error);
      location = {pagename: '/', params: {}};
    }
    return location;
  }

  nativeLocationToNativeUrl(nativeLocation: NativeLocation): string {
    const {pathname, search, hash} = nativeLocation;
    return [`/${pathname.replace(/^\/+|\/+$/g, '')}`, search && `?${search}`, hash && `#${hash}`].join('');
  }

  locationToNativeUrl(location: PartialLocation<P>): string {
    const nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToNativeUrl(nativeLocation);
  }

  locationToUrl(location: PartialLocation<P>): string {
    return [location.pagename, JSON.stringify(location.params || {})].join('?');
  }

  payloadToPartial(payload: PayloadLocation<P, N>): PartialLocation<P> {
    let params = payload.params;
    const extendParams = payload.extendParams === 'current' ? this.routeState.params : payload.extendParams;
    if (extendParams && params) {
      params = deepMerge({}, extendParams, params);
    } else if (extendParams) {
      params = extendParams;
    }
    return {pagename: payload.pagename || this.routeState.pagename, params: params || {}};
  }

  async relaunch(data: PayloadLocation<P, N> | string, internal?: boolean): Promise<RouteState<P>> {
    let location: Location<P>;
    if (typeof data === 'string') {
      location = this.urlToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.url = this.locationToUrl(routeState);
    this._nativeData = undefined;
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }
    this.nativeRouter.relaunch(this._getNativeUrl, key, !!internal);
    return routeState;
  }

  async push(data: PayloadLocation<P, N> | string, internal?: boolean): Promise<RouteState<P>> {
    let location: Location<P>;
    if (typeof data === 'string') {
      location = this.urlToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'PUSH', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.url = this.locationToUrl(routeState);
    this._nativeData = undefined;
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().push(location, key);
    } else {
      this.history.push(location, key);
    }
    this.nativeRouter.push(this._getNativeUrl, key, !!internal);
    return routeState;
  }

  async replace(data: PayloadLocation<P, N> | string, internal?: boolean): Promise<RouteState<P>> {
    let location: Location<P>;
    if (typeof data === 'string') {
      location = this.urlToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'REPLACE', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.url = this.locationToUrl(routeState);
    this._nativeData = undefined;
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().replace(location, key);
    } else {
      this.history.replace(location, key);
    }
    this.nativeRouter.replace(this._getNativeUrl, key, !!internal);
    return routeState;
  }

  async back(n: number = 1, internal?: boolean): Promise<RouteState<P>> {
    const stack = internal ? this.history.getCurrentInternalHistory().getActionRecord(n) : this.history.getActionRecord(n);
    if (!stack) {
      return Promise.reject(1);
    }
    const uri = stack.uri;
    const {key, location} = uriToLocation<P>(uri);
    const routeState: RouteState<P> = {...location, action: 'BACK', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.url = this.locationToUrl(routeState);
    this._nativeData = undefined;
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
    }
    this.nativeRouter.back(this._getNativeUrl, n, key, !!internal);
    return routeState;
  }

  async pop(n: number = 1, internal?: boolean): Promise<RouteState<P>> {
    const stack = internal ? this.history.getCurrentInternalHistory().getPageRecord(n) : this.history.getPageRecord(n);
    if (!stack) {
      return Promise.reject(1);
    }
    const uri = stack.uri;
    const {key, location} = uriToLocation<P>(uri);
    const routeState: RouteState<P> = {...location, action: 'POP', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.url = this.locationToUrl(routeState);
    this._nativeData = undefined;
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().pop(n);
    } else {
      this.history.pop(n);
    }
    this.nativeRouter.pop(this._getNativeUrl, n, key, !!internal);
    return routeState;
  }

  abstract destroy(): void;
}
