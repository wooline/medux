import {
  BaseHistoryActions,
  LocationPayload,
  MeduxLocation,
  RouteConfig,
  RoutePayload,
  TransformRoute,
  buildTransformRoute,
  checkLocation,
  safelocationToUrl,
  safeurlToLocation,
} from '@medux/route-plan-a';
import {History, createBrowserHistory, createHashHistory, createMemoryHistory} from 'history';
import {HistoryProxy, RouteData, RouteParams} from '@medux/core';

type UnregisterCallback = () => void;

export enum Action {
  Push = 'PUSH',
  Pop = 'POP',
  Replace = 'REPLACE',
}
export type LocationToLocation = (location: MeduxLocation) => MeduxLocation;
export type LocationMap = {in: LocationToLocation; out: LocationToLocation};

/**
 * 经过封装后的HistoryAPI比浏览器自带的history更强大
 */
export interface HistoryActions<P extends RouteParams = any> extends HistoryProxy<MeduxLocation> {
  getRouteData(): RouteData;
  push(data: RoutePayload<P> | LocationPayload | string): Promise<void>;
  replace(data: RoutePayload<P> | LocationPayload | string): Promise<void>;
  toUrl(data: RoutePayload<P> | LocationPayload | string): string;
  go(n: number): void;
  back(): void;
  forward(): void;
  dispatch(location: MeduxLocation): Promise<void>;
}

class WebHistoryActions extends BaseHistoryActions {
  private _unlistenHistory: UnregisterCallback;

  constructor(private _history: History, _transformRoute: TransformRoute<any>, private _locationMap: LocationMap | undefined) {
    super(_locationMap ? _locationMap.in({..._history.location, action: _history.action}) : {..._history.location, action: _history.action}, true, _transformRoute);
    this._unlistenHistory = this._history.block((location, action) => {
      const meduxLocation = _locationMap ? _locationMap.in({...location, action}) : {...location, action};
      if (!this.equal(meduxLocation, this.getLocation())) {
        return `${meduxLocation.action}::${safelocationToUrl(meduxLocation)}`;
      }
    });
  }

  destroy() {
    this._unlistenHistory();
  }

  toUrl(data: string | LocationPayload | RoutePayload<any>): string {
    let location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    location = this._locationMap ? this._locationMap.out(location) : location;
    return location.pathname + location.search + location.hash;
  }

  patch(location: MeduxLocation, routeData: RouteData<any>): void {
    this.push(location);
  }

  push(data: RoutePayload<any> | LocationPayload | string): Promise<void> {
    const location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    return this.dispatch({...location, action: Action.Push}).then(() => {
      this._history.push(this._locationMap ? this._locationMap.out(location) : location);
    });
  }

  replace(data: RoutePayload<any> | LocationPayload | string): Promise<void> {
    const location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    return this.dispatch({...location, action: Action.Replace}).then(() => {
      this._history.push(this._locationMap ? this._locationMap.out(location) : location);
    });
  }

  go(n: number) {
    this._history.go(n);
  }

  back() {
    this._history.goBack();
  }

  forward() {
    this._history.goForward();
  }

  passive() {
    throw 1;
  }
}
/**
 * 创建一个路由解析器
 * @param history 浏览器的history或其代理
 * @param routeConfig 应用的路由配置文件
 * @returns {transformRoute,historyActions}
 */
export function createRouter(createHistory: 'Hash' | 'Memory', routeConfig: RouteConfig, locationMap?: LocationMap) {
  let history: History;

  const historyOptions = {
    getUserConfirmation(str: string, callback: (result: boolean) => void) {
      const arr = str.split('::');
      const location = safeurlToLocation(arr.join('::'));
      location.action = arr.shift();
      historyActions
        .dispatch(location)
        .then(() => {
          callback(true);
        })
        .catch((e) => {
          callback(false);
          throw e;
        });
    },
  };
  if (createHistory === 'Hash') {
    history = createHashHistory(historyOptions);
  } else if (createHistory == 'Memory') {
    history = createMemoryHistory(historyOptions);
  } else {
    history = createBrowserHistory(historyOptions);
  }
  const getCurPathname = () => {
    return historyActions.getLocation().pathname;
  };
  const _locationMap = locationMap;
  if (locationMap && _locationMap) {
    _locationMap.in = (location) => checkLocation(locationMap.in(location), getCurPathname());
    _locationMap.out = (location) => checkLocation(locationMap.out(location), getCurPathname());
  }
  const transformRoute: TransformRoute = buildTransformRoute(routeConfig, getCurPathname);
  const historyActions: HistoryActions = new WebHistoryActions(history, transformRoute, _locationMap);
  return {
    transformRoute,
    historyActions,
  };
}
