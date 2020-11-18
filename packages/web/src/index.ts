/* eslint-disable @typescript-eslint/no-use-before-define */
import {BaseHistoryActions, Location, RouteRule, NativeHistory, LocationMap, PaLocation, RouteParams} from '@medux/route-plan-a';
import {History, createBrowserHistory, createHashHistory, createMemoryHistory, Location as HistoryLocation} from 'history';
import {env} from '@medux/core';

type UnregisterCallback = () => void;

function locationToUrl(loaction: PaLocation): string {
  return loaction.pathname + loaction.search + loaction.hash;
}
export class WebNativeHistory implements NativeHistory {
  public history: History<never>;

  constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string, public locationMap?: LocationMap) {
    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
    } else {
      const [pathname, search = ''] = createHistory.split('?');
      this.history = {
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
          pathname,
          search: search && `?${search}`,
          hash: '',
        } as any,
      };
    }
  }

  block(blocker: (location: PaLocation, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => false | void) {
    return this.history.block((location, action) => {
      return blocker({pathname: location.pathname, search: location.search, hash: location.hash}, this.getKey(location), action);
    });
  }

  getUrl() {
    const location = this.locationMap ? this.locationMap.in(this.history.location) : this.history.location;
    return locationToUrl(location);
  }

  getKey(location: HistoryLocation): string {
    return (location.state || '') as string;
  }

  push(location: Location): void {
    this.history.push(locationToUrl(location), location.key as any);
  }

  replace(location: Location): void {
    this.history.replace(locationToUrl(location), location.key as any);
  }

  relaunch(location: Location): void {
    this.history.push(locationToUrl(location), location.key as any);
  }

  pop(location: Location, n: number): void {
    this.history.go(-n);
  }
}
export class HistoryActions<P extends RouteParams = RouteParams> extends BaseHistoryActions<P> {
  private _unlistenHistory: UnregisterCallback;

  private _timer: number = 0;

  constructor(protected nativeHistory: WebNativeHistory, protected defaultRouteParams: {[moduleName: string]: any}, protected routeRule: RouteRule, protected locationMap?: LocationMap) {
    super(nativeHistory, defaultRouteParams, nativeHistory.getUrl(), routeRule, locationMap);
    this._unlistenHistory = this.nativeHistory.block((location, key, action) => {
      if (key !== this.getCurKey()) {
        let callback: (() => void) | undefined;
        let index: number = 0;
        if (action === 'POP') {
          index = this.findHistoryByKey(key).index;
        }
        if (index > 0) {
          callback = () => {
            this._timer = 0;
            this.pop(index);
          };
        } else {
          const paLocation = this.locationMap ? this.locationMap.in(location) : location;
          if (action === 'REPLACE') {
            callback = () => {
              this._timer = 0;
              this.replace(paLocation);
            };
          } else if (action === 'PUSH') {
            callback = () => {
              this._timer = 0;
              this.push(paLocation);
            };
          } else {
            callback = () => {
              this._timer = 0;
              this.relaunch(paLocation);
            };
          }
        }
        if (callback && !this._timer) {
          this._timer = env.setTimeout(callback, 50);
        }
        return false;
      }
      return undefined;
    });
  }

  getNativeHistory() {
    return this.nativeHistory.history;
  }

  destroy() {
    this._unlistenHistory();
  }

  refresh() {
    this.nativeHistory.history.go(0);
  }
}

export function createRouter(createHistory: 'Browser' | 'Hash' | 'Memory' | string, defaultRouteParams: {[moduleName: string]: any}, routeRule: RouteRule, locationMap?: LocationMap) {
  const nativeHistory = new WebNativeHistory(createHistory);
  const historyActions = new HistoryActions(nativeHistory, defaultRouteParams, routeRule, locationMap);
  return historyActions;
}
