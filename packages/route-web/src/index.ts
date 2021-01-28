import {Middleware, Reducer} from 'redux';
import {CoreModuleHandlers, CoreModuleState, config, reducer, deepMerge, deepMergeState, mergeState} from '@medux/core';
import {uriToLocation, History} from './basic';

import type {LocationTransform} from './transform';
import type {RootParams, Location, NativeLocation, RouteState, HistoryAction, RoutePayload} from './basic';

export {setRouteConfig, routeConfig} from './basic';
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
  push(url: string, key: string, internal: boolean): void;
  replace(url: string, key: string, internal: boolean): void;
  relaunch(url: string, key: string, internal: boolean): void;
  back(url: string, n: number, key: string, internal: boolean): void;
  pop(url: string, n: number, key: string, internal: boolean): void;
}

export abstract class BaseRouter<P extends RootParams, N extends string> {
  private _tid = 0;

  private routeState: RouteState<P>;

  private nativeLocation: NativeLocation;

  private url: string;

  protected store: Store | undefined;

  public readonly history: History;

  constructor(initUrl: string, public nativeRouter: NativeRouter, protected locationTransform: LocationTransform<P>) {
    this.nativeLocation = this.urlToNativeLocation(initUrl);
    this.url = this.nativeLocationToUrl(this.nativeLocation);
    const location = this.locationTransform.in(this.nativeLocation);
    const key = this._createKey();
    this.history = new History();
    const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
    this.routeState = routeState;
    this.history.relaunch(location, key);
  }

  getRouteState(): RouteState<P> {
    return this.routeState;
  }

  getNativeLocation() {
    return this.nativeLocation;
  }

  getUrl() {
    return this.url;
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

  payloadToLocation(data: RoutePayload<P, N>): Location<P> {
    const {pagename} = data;
    const extendParams = data.extendParams === true ? this.routeState.params : data.extendParams;
    const params: P = extendParams && data.params ? (deepMerge({}, extendParams, data.params) as any) : data.params;
    return {pagename: pagename || this.routeState.pagename || '/', params};
  }

  urlToToLocation(url: string): Location<P> {
    const nativeLocation = this.urlToNativeLocation(url);
    return this.locationTransform.in(nativeLocation);
  }

  urlToNativeLocation(url: string): NativeLocation {
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
    let pathname = path;
    if (!pathname.startsWith('/')) {
      pathname = `/${pathname}`;
    }
    pathname = pathname.replace(/\/*$/, '') || '/';
    return {
      pathname,
      search,
      hash,
    };
  }

  nativeLocationToUrl(nativeLocation: NativeLocation): string {
    const {pathname, search, hash} = nativeLocation;
    return [pathname && pathname.replace(/\/*$/, ''), search && `?${search}`, hash && `#${hash}`].join('');
  }

  locationToUrl(location: Location<P>): string {
    const nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToUrl(nativeLocation);
  }

  async relaunch(data: RoutePayload<P, N> | string, internal?: boolean): Promise<RouteState<P>> {
    const location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store!.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);
    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }
    this.nativeRouter.relaunch(this.url, key, !!internal);
    return routeState;
  }

  async push(data: RoutePayload<P, N> | string, internal?: boolean): Promise<RouteState<P>> {
    const location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'PUSH', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store!.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);
    if (internal) {
      this.history.getCurrentInternalHistory().push(location, key);
    } else {
      this.history.push(location, key);
    }
    this.nativeRouter.push(this.url, key, !!internal);
    return routeState;
  }

  async replace(data: RoutePayload<P, N> | string, internal?: boolean): Promise<RouteState<P>> {
    const location = typeof data === 'string' ? this.urlToToLocation(data) : this.payloadToLocation(data);
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'REPLACE', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this.routeState = routeState;
    this.store!.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);
    if (internal) {
      this.history.getCurrentInternalHistory().replace(location, key);
    } else {
      this.history.replace(location, key);
    }
    this.nativeRouter.replace(this.url, key, !!internal);
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
    this.store!.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);
    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
    }
    this.nativeRouter.back(this.url, n, key, !!internal);
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
    this.store!.dispatch(routeChangeAction(routeState));
    this.nativeLocation = this.locationTransform.out(location);
    this.url = this.nativeLocationToUrl(this.nativeLocation);
    if (internal) {
      this.history.getCurrentInternalHistory().pop(n);
    } else {
      this.history.pop(n);
    }
    this.nativeRouter.pop(this.url, n, key, !!internal);
    return routeState;
  }

  abstract destroy(): void;
}
