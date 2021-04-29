import {env, deepMerge, isPromise} from '@medux/core';

import {uriToLocation, nativeUrlToNativeLocation, nativeLocationToNativeUrl, History, routeConfig, setRouteConfig} from './basic';
import {testRouteChangeAction, routeChangeAction} from './module';
import type {LocationTransform} from './transform';
import type {RootParams, Location, NativeLocation, RouteState, PayloadLocation, PartialLocation} from './basic';

export {setRouteConfig, routeConfig, nativeUrlToNativeLocation} from './basic';
export {PagenameMap, createLocationTransform} from './transform';
export {routeMiddleware, createRouteModule, RouteActionTypes, ModuleWithRouteHandlers} from './module';
export type {RouteModule} from './module';
export type {LocationTransform} from './transform';
export type {RootParams, Location, NativeLocation, RouteState, HistoryAction, DeepPartial, PayloadLocation} from './basic';

interface Store {
  dispatch(action: {type: string}): any;
}

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

  // 只有当native不处理时返回void，否则必须返回NativeData，返回void会导致不依赖onChange来关闭task

  protected abstract push(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;

  protected abstract replace(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;

  protected abstract relaunch(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;

  protected abstract back(getNativeData: () => NativeData, n: number, key: string): void | NativeData | Promise<NativeData>;

  public abstract toOutside(url: string): void;

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

  execute(method: 'relaunch' | 'push' | 'replace' | 'back', getNativeData: () => NativeData, ...args: any[]): Promise<NativeData | undefined> {
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

  private _lid: number = 0;

  protected readonly listenerMap: {[id: string]: (data: RouteState<P>) => void | Promise<void>} = {};

  constructor(
    nativeLocationOrNativeUrl: NativeLocation | string,
    public nativeRouter: BaseNativeRouter,
    protected locationTransform: LocationTransform<P>
  ) {
    nativeRouter.setRouter(this);
    const location =
      typeof nativeLocationOrNativeUrl === 'string'
        ? this.nativeUrlToLocation(nativeLocationOrNativeUrl)
        : this.nativeLocationToLocation(nativeLocationOrNativeUrl);
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    if (!routeConfig.indexUrl) {
      setRouteConfig({indexUrl: this.meduxUrl});
    }
    this._nativeData = undefined;
    this.history = new History({location, key});
  }

  addListener(callback: (data: RouteState<P>) => void | Promise<void>) {
    this._lid++;
    const id = `${this._lid}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  protected dispatch(data: RouteState<P>) {
    const listenerMap = this.listenerMap;
    const arr = Object.keys(listenerMap).map((id) => listenerMap[id](data));
    return Promise.all(arr);
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

  findHistoryIndex(key: string) {
    return this.history.findIndex(key);
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

  relaunch(
    data: PayloadLocation<P, N> | NativeLocation | string,
    internal: boolean = false,
    disableNative: boolean = routeConfig.disableNativeRoute
  ) {
    this.addTask(this._relaunch.bind(this, data, internal, disableNative));
  }

  private async _relaunch(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean, disableNative: boolean) {
    // : Promise<RouteState<P>>
    let location: Location<P>;
    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return;
      }
      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
    await this.store!.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData: NativeData | undefined;
    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute(
        'relaunch',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        key
      );
    }
    this._nativeData = nativeData;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    this.store!.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory()!.relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }
  }

  push(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean = false, disableNative: boolean = routeConfig.disableNativeRoute) {
    this.addTask(this._push.bind(this, data, internal, disableNative));
  }

  private async _push(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean, disableNative: boolean) {
    let location: Location<P>;
    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return;
      }
      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'PUSH', key};
    await this.store!.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData: NativeData | void;
    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute(
        'push',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        key
      );
    }
    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    if (internal) {
      this.history.getCurrentInternalHistory()!.push(location, key);
    } else {
      this.history.push(location, key);
    }
    this.store!.dispatch(routeChangeAction(routeState));
  }

  replace(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean = false, disableNative: boolean = routeConfig.disableNativeRoute) {
    this.addTask(this._replace.bind(this, data, internal, disableNative));
  }

  private async _replace(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean, disableNative: boolean) {
    let location: Location<P>;
    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return;
      }
      location = this.urlToLocation(data);
    } else if (dataIsNativeLocation(data)) {
      location = this.nativeLocationToLocation(data);
    } else {
      location = this.locationTransform.in(this.payloadToPartial(data));
    }
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'REPLACE', key};
    await this.store!.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData: NativeData | void;
    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute(
        'replace',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        key
      );
    }
    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    if (internal) {
      this.history.getCurrentInternalHistory()!.replace(location, key);
    } else {
      this.history.replace(location, key);
    }
    this.store!.dispatch(routeChangeAction(routeState));
  }

  back(n: number = 1, indexUrl: string = 'index', internal: boolean = false, disableNative: boolean = routeConfig.disableNativeRoute) {
    this.addTask(this._back.bind(this, n, indexUrl === 'index' ? routeConfig.indexUrl : indexUrl, internal, disableNative));
  }

  private async _back(n: number = 1, indexUrl: string, internal: boolean, disableNative: boolean) {
    const stack = internal ? this.history.getCurrentInternalHistory()!.getRecord(n - 1) : this.history.getRecord(n - 1);
    if (!stack) {
      if (indexUrl) {
        return this._relaunch(indexUrl || routeConfig.indexUrl, internal, disableNative);
      }
      throw {code: '1', message: 'history not found'};
    }
    const uri = stack.uri;
    const {key, location} = uriToLocation<P>(uri);
    const routeState: RouteState<P> = {...location, action: 'BACK', key};
    await this.store!.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData: NativeData | void;
    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute(
        'back',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        n,
        key
      );
    }
    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.meduxUrl = this.locationToMeduxUrl(routeState);
    if (internal) {
      this.history.getCurrentInternalHistory()!.back(n);
    } else {
      this.history.back(n);
    }
    this.store!.dispatch(routeChangeAction(routeState));
    return undefined;
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
