import {Middleware, Reducer} from 'redux';
import {CoreModuleHandlers, CoreModuleState, config, reducer, deepMergeState, mergeState, env, deepMerge, isPromise} from '@medux/core';
import {uriToLocation, nativeUrlToNativeLocation, nativeLocationToNativeUrl, History} from './basic';

import type {LocationTransform} from './transform';
import type {RootParams, Location, NativeLocation, RouteState, HistoryAction, PayloadLocation, PartialLocation} from './basic';

export {setRouteConfig, routeConfig, nativeUrlToNativeLocation} from './basic';
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

export type NativeData = {nativeLocation: NativeLocation; nativeUrl: string};

function dataIsNativeLocation(data: PayloadLocation<any, string> | NativeLocation): data is NativeLocation {
  return data['pathname'];
}

interface RouterTask {
  method: string;
}
interface NativeRouterTask {
  resolve: (nativeData: NativeData | undefined) => void;
  reject: () => void;
  nativeData: undefined | NativeData;
}
export abstract class BaseNativeRouter {
  protected curTask?: NativeRouterTask;

  protected taskList: RouterTask[] = [];

  protected router: BaseRouter<any, string> = null as any;

  protected abstract push(getNativeData: () => NativeData, key: string, internal: boolean): void | NativeData | Promise<NativeData>;

  protected abstract replace(getNativeData: () => NativeData, key: string, internal: boolean): void | NativeData | Promise<NativeData>;

  protected abstract relaunch(getNativeData: () => NativeData, key: string, internal: boolean): void | NativeData | Promise<NativeData>;

  protected abstract back(getNativeData: () => NativeData, n: number, key: string, internal: boolean): void | NativeData | Promise<NativeData>;

  // 只有当native不处理时返回void，否则必须返回NativeData，返回void会导致不依赖onChange来关闭task
  protected abstract pop(getNativeData: () => NativeData, n: number, key: string, internal: boolean): void | NativeData | Promise<NativeData>;

  abstract destroy(): void;

  protected onChange(key: string): boolean {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }
    return key !== this.router.getCurKey();
  }

  setRouter(router: BaseRouter<any, string>) {
    this.router = router;
  }

  execute(method: 'relaunch' | 'push' | 'replace' | 'back' | 'pop', getNativeData: () => NativeData, ...args: any[]): Promise<NativeData | undefined> {
    return new Promise((resolve, reject) => {
      const task: NativeRouterTask = {resolve, reject, nativeData: undefined};
      this.curTask = task;
      const result: void | NativeData | Promise<NativeData> = this[method as string](() => {
        const nativeData = getNativeData();
        task.nativeData = nativeData;
        return nativeData;
      }, ...args);
      if (!result) {
        // 表示native不做任何处理，也不会触发onChange
        resolve(undefined);
        this.curTask = undefined;
      } else if (isPromise(result)) {
        // 存在错误时，不会触发onChange，需要手动触发，否则都会触发onChange
        result.catch((e) => {
          reject(e);
          this.curTask = undefined;
        });
      }
    });
  }
}

export abstract class BaseRouter<P extends RootParams, N extends string> {
  private _tid = 0;

  private curTask?: () => Promise<void>;

  private taskList: Array<() => Promise<void>> = [];

  private _nativeData: {nativeLocation: NativeLocation; nativeUrl: string} | undefined;

  private routeState: RouteState<P>;

  private meduxUrl: string;

  protected store: Store | undefined;

  public readonly history: History;

  constructor(nativeLocationOrNativeUrl: NativeLocation | string, public nativeRouter: BaseNativeRouter, protected locationTransform: LocationTransform<P>) {
    nativeRouter.setRouter(this);
    const location = typeof nativeLocationOrNativeUrl === 'string' ? this.nativeUrlToLocation(nativeLocationOrNativeUrl) : this.nativeLocationToLocation(nativeLocationOrNativeUrl);
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this._nativeData = undefined;
    this.history = new History();
    this.history.relaunch(location, key);
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

  getMeduxUrl() {
    return this.meduxUrl;
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

  getCurKey(): string {
    return this.routeState.key;
  }

  searchKeyInActions(key: string) {
    return this.history.getActionIndex(key);
  }

  private _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  nativeUrlToNativeLocation(url: string): NativeLocation {
    return nativeUrlToNativeLocation(url);
  }

  nativeLocationToLocation(nativeLocation: NativeLocation): Location<P> {
    let location: Location<P>;
    try {
      location = this.locationTransform.in(nativeLocation);
    } catch (error) {
      env.console.warn(error);
      location = {pagename: '/', params: {}};
    }
    return location;
  }

  nativeUrlToLocation(nativeUrl: string): Location<P> {
    return this.nativeLocationToLocation(this.nativeUrlToNativeLocation(nativeUrl));
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
    return nativeLocationToNativeUrl(nativeLocation);
  }

  locationToNativeUrl(location: PartialLocation<P>): string {
    const nativeLocation = this.locationTransform.out(location);
    return this.nativeLocationToNativeUrl(nativeLocation);
  }

  locationToMeduxUrl(location: PartialLocation<P>): string {
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

  relaunch(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, passive?: boolean) {
    this.addTask(this._relaunch.bind(this, data, internal, passive));
  }

  private async _relaunch(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, passive?: boolean) {
    // : Promise<RouteState<P>>
    let location: Location<P>;
    if (typeof data === 'string') {
      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    let nativeData: NativeData | undefined;
    if (!passive) {
      nativeData = await this.nativeRouter.execute(
        'relaunch',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        key,
        !!internal
      );
    }
    this._nativeData = nativeData;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }
  }

  push(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, passive?: boolean) {
    this.addTask(this._push.bind(this, data, internal, passive));
  }

  async _push(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, passive?: boolean): Promise<RouteState<P>> {
    let location: Location<P>;
    if (typeof data === 'string') {
      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'PUSH', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    let nativeData: NativeData | void;
    if (!passive) {
      nativeData = await this.nativeRouter.execute(
        'push',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        key,
        !!internal
      );
    }
    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().push(location, key);
    } else {
      this.history.push(location, key);
    }
    return routeState;
  }

  replace(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, passive?: boolean) {
    this.addTask(this._replace.bind(this, data, internal, passive));
  }

  async _replace(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, passive?: boolean): Promise<RouteState<P>> {
    let location: Location<P>;
    if (typeof data === 'string') {
      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'REPLACE', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    let nativeData: NativeData | void;
    if (!passive) {
      nativeData = await this.nativeRouter.execute(
        'replace',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        key,
        !!internal
      );
    }
    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().replace(location, key);
    } else {
      this.history.replace(location, key);
    }
    return routeState;
  }

  back(n: number = 1, internal?: boolean, passive?: boolean) {
    this.addTask(this._back.bind(this, n, internal, passive));
  }

  async _back(n: number = 1, internal?: boolean, passive?: boolean): Promise<RouteState<P>> {
    const stack = internal ? this.history.getCurrentInternalHistory().getActionRecord(n) : this.history.getActionRecord(n);
    if (!stack) {
      return Promise.reject(1);
    }
    const uri = stack.uri;
    const {key, location} = uriToLocation<P>(uri);
    const routeState: RouteState<P> = {...location, action: 'BACK', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    let nativeData: NativeData | void;
    if (!passive) {
      nativeData = await this.nativeRouter.execute(
        'back',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        n,
        key,
        !!internal
      );
    }
    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
    }
    return routeState;
  }

  pop(n: number = 1, internal?: boolean, passive?: boolean) {
    this.addTask(this._pop.bind(this, n, internal, passive));
  }

  async _pop(n: number = 1, internal?: boolean, passive?: boolean): Promise<RouteState<P>> {
    const stack = internal ? this.history.getCurrentInternalHistory().getPageRecord(n) : this.history.getPageRecord(n);
    if (!stack) {
      return Promise.reject(1);
    }
    const uri = stack.uri;
    const {key, location} = uriToLocation<P>(uri);
    const routeState: RouteState<P> = {...location, action: 'POP', key};
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    let nativeData: NativeData | void;
    if (!passive) {
      nativeData = await this.nativeRouter.execute(
        'pop',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        n,
        key,
        !!internal
      );
    }
    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory().pop(n);
    } else {
      this.history.pop(n);
    }
    return routeState;
  }

  private taskComplete() {
    const task = this.taskList.shift();
    if (task) {
      this.executeTask(task);
    } else {
      this.curTask = undefined;
    }
  }

  private executeTask(task: () => Promise<void>) {
    this.curTask = task;
    task().finally(this.taskComplete.bind(this));
  }

  private addTask(task: () => Promise<any>) {
    if (this.curTask) {
      this.taskList.push(task);
    } else {
      this.executeTask(task);
    }
  }

  destroy() {
    this.nativeRouter.destroy();
  }
}
