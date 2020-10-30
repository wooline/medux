/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  BaseHistoryActions,
  LocationPayload,
  Location,
  PaLocation,
  RouteConfig,
  RoutePayload,
  LocationMap,
  buildTransformRoute,
  checkLocation,
  safelocationToUrl,
  safeurlToLocation,
} from '@medux/route-plan-a';
import {History, createBrowserHistory, createHashHistory, createMemoryHistory} from 'history';
import {HistoryProxy, RouteData, RouteParams} from '@medux/core';

type UnregisterCallback = () => void;

// export enum Action {
//   Push = 'PUSH',
//   Pop = 'POP',
//   Replace = 'REPLACE',
// }
// export type LocationToLocation = (location: PaLocation) => PaLocation;
// export type LocationMap = {in: LocationToLocation; out: LocationToLocation};

// /**
//  * 经过封装后的HistoryAPI比浏览器自带的history更强大
//  */
// export interface HistoryActions<P extends RouteParams = any> extends HistoryProxy<MeduxLocation> {
//   getHistory(): History;
//   getRouteData(): RouteData;
//   push(data: RoutePayload<P> | LocationPayload | string): Promise<void>;
//   replace(data: RoutePayload<P> | LocationPayload | string): Promise<void>;
//   toUrl(data: RoutePayload<P> | LocationPayload | string): string;
//   go(n: number): void;
//   back(): void;
//   forward(): void;
//   dispatch(location: MeduxLocation): Promise<void>;
// }

export class HistoryActions<P extends RouteParams = RouteParams> extends BaseHistoryActions<P> {
  private _unlistenHistory: UnregisterCallback;

  constructor(public nativeHistory: History, private routeConfig: RouteConfig, locationMap?: LocationMap) {
    super(nativeHistory, true, routeConfig, locationMap);
    this._unlistenHistory = nativeHistory.block((location, action) => {
      const paLocation = locationMap ? locationMap.in(location) : location;
      if (!this.equal(paLocation, this.getLocation())) {
        // 如果宿主路由未经过本系统而先变化，此时需要经过确认
        return `${action}::${safelocationToUrl(paLocation)}`;
      }
      return undefined;
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
    return this.dispatch({...location, action: 'PUSH'}).then(() => {
      this.nativeHistory.push(this._locationMap ? this._locationMap.out(location) : location);
    });
  }

  replace(data: RoutePayload<any> | LocationPayload | string): Promise<void> {
    const location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    return this.dispatch({...location, action: 'REPLACE'}).then(() => {
      this._history.replace(this._locationMap ? this._locationMap.out(location) : location);
    });
  }

  relaunch(data: RoutePayload<any> | LocationPayload | string): Promise<void> {
    const location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    return this.dispatch({...location, action: 'RELAUNCH'}).then(() => {
      this._history.replace(this._locationMap ? this._locationMap.out(location) : location);
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

export function createRouter(createHistory: 'Browser' | 'Hash' | 'Memory' | string, routeConfig: RouteConfig, locationMap?: LocationMap) {
  let navtiveHistory: History;
  let historyActions: HistoryActions;

  const historyOptions = {
    getUserConfirmation(str: string, callback: (result: boolean) => void) {
      const [action, url] = str.split('::');
      const location: Location = {...safeurlToLocation(url), action: action as any, key: '', url};

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
    navtiveHistory = createHashHistory(historyOptions);
  } else if (createHistory === 'Memory') {
    navtiveHistory = createMemoryHistory(historyOptions);
  } else if (createHistory === 'Browser') {
    navtiveHistory = createBrowserHistory(historyOptions);
  } else {
    const [pathname, search = ''] = createHistory.split('?');
    navtiveHistory = {
      action: 'PUSH',
      length: 0,
      listen() {
        return () => undefined;
      },
      createHref() {
        return '';
      },
      push() {},
      replace() {},
      go() {},
      goBack() {},
      goForward() {},
      block() {
        return () => undefined;
      },
      location: {
        state: null,
        pathname,
        search: search && `?${search}`,
        hash: '',
      },
    };
  }
  historyActions = new HistoryActions(navtiveHistory, routeConfig, locationMap);
  return historyActions;
}
