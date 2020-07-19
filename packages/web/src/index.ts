import {Dispatcher, LocationPayload, MeduxLocation, RouteConfig, RoutePayload, TransformRoute, buildTransformRoute} from '@medux/route-plan-a';
import {HistoryProxy, RouteData, RouteParams} from '@medux/core';

type UnregisterCallback = () => void;

export type LocationToLocation = (location: MeduxLocation) => MeduxLocation;
export type LocationMap = {in: LocationToLocation; out: LocationToLocation};

export interface History {
  location: MeduxLocation;
  action: string;
  push(location: MeduxLocation): void;
  replace(location: MeduxLocation): void;
  go(n: number): void;
  back(): void;
  forward(): void;
  listen(listener: (location: MeduxLocation, action: string) => void): UnregisterCallback;
}

/**
 * 经过封装后的HistoryAPI比浏览器自带的history更强大
 */
export interface HistoryActions<P extends RouteParams = any> extends HistoryProxy<MeduxLocation> {
  getRouteData(): RouteData;
  push(data: RoutePayload<P> | LocationPayload | string): void;
  replace(data: RoutePayload<P> | LocationPayload | string): void;
  toUrl(data: RoutePayload<P> | LocationPayload | string): string;
  go(n: number): void;
  back(): void;
  forward(): void;
}

class BrowserHistoryActions implements HistoryActions {
  readonly initialized = true;
  private _dispatcher: Dispatcher;
  private _location: MeduxLocation;
  private _unlistenHistory: UnregisterCallback;

  constructor(private _history: History, private _transformRoute: TransformRoute<any>, private _locationMap: LocationMap | undefined) {
    this._dispatcher = new Dispatcher();
    const location: MeduxLocation = {...this._history.location, action: this._history.action};
    this._location = this._locationMap ? this._locationMap.in(location) : location;
    this._unlistenHistory = this._history.listen((location, action) => {
      location = {...location, action};
      this._location = this._locationMap ? this._locationMap.in(location) : location;
      this._dispatcher.dispatch(this._location);
    });
  }
  destroy() {
    this._unlistenHistory();
  }
  getLocation(): MeduxLocation {
    return this._location;
  }
  getRouteData() {
    return this._transformRoute.locationToRoute(this.getLocation());
  }
  subscribe(listener: (location: MeduxLocation) => void): () => void {
    return this._dispatcher.subscribe(listener);
  }
  locationToRouteData(location: MeduxLocation): RouteData<any> {
    return this._transformRoute.locationToRoute(location);
  }
  equal(a: MeduxLocation, b: MeduxLocation): boolean {
    return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
  }
  patch(location: MeduxLocation, routeData: RouteData<any>): void {
    this.push(location);
  }
  push(data: RoutePayload<any> | LocationPayload | string): void {
    const location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    this._history.push(this._locationMap ? this._locationMap.out(location) : location);
  }
  replace(data: RoutePayload<any> | LocationPayload | string): void {
    const location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    this._history.push(this._locationMap ? this._locationMap.out(location) : location);
  }
  toUrl(data: string | LocationPayload | RoutePayload<any>): string {
    let location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    location = this._locationMap ? this._locationMap.out(location) : location;
    return location.pathname + location.search + location.hash;
  }
  go(n: number) {
    this._history.go(n);
  }
  back() {
    this._history.back();
  }
  forward() {
    this._history.forward();
  }
}
/**
 * 创建一个路由解析器
 * @param history 浏览器的history或其代理
 * @param routeConfig 应用的路由配置文件
 * @returns {transformRoute,historyActions}
 */
export function createRouter(history: History, routeConfig: RouteConfig, locationMap?: LocationMap) {
  const transformRoute: TransformRoute = buildTransformRoute(routeConfig, () => {
    return historyActions.getLocation().pathname;
  });
  const historyActions: HistoryActions = new BrowserHistoryActions(history, transformRoute, locationMap);
  return {
    transformRoute,
    historyActions,
  };
}
