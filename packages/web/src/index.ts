/* eslint-disable @typescript-eslint/no-use-before-define */
import {BaseHistoryActions, Location, RouteConfig, NativeHistory, LocationMap, locationToUrl, PaLocation} from '@medux/route-plan-a';
import {History, createBrowserHistory, createHashHistory, createMemoryHistory, Location as HistoryLocation} from 'history';
import {RouteParams, env} from '@medux/core';

type UnregisterCallback = () => void;

export class WebNativeHistory implements NativeHistory {
  public history: History;

  public initLocation: PaLocation;

  public actions: HistoryActions | undefined;

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
          state: null,
          pathname,
          search: search && `?${search}`,
          hash: '',
        },
      };
    }
    const location = this.hsLocationToPaLocation(this.history.location);
    this.initLocation = this.locationMap ? this.locationMap.in(location) : location;
  }

  block(blocker: (location: PaLocation, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => false | void) {
    return this.history.block((location, action) => {
      return blocker(this.hsLocationToPaLocation(location), this.getKey(location), action);
    });
  }

  hsLocationToPaLocation(historyLocation: HistoryLocation): PaLocation {
    return {pathname: historyLocation.pathname, search: historyLocation.search, hash: historyLocation.hash};
  }

  getKey(location: HistoryLocation): string {
    return (location.state || '') as string;
  }

  push(location: Location): void {
    this.history.push(locationToUrl(location), location.key);
  }

  replace(location: Location): void {
    this.history.replace(locationToUrl(location), location.key);
  }

  relaunch(location: Location): void {
    this.history.push(locationToUrl(location), location.key);
  }

  pop(location: Location, n: number): void {
    this.history.go(-n);
  }
}
export class HistoryActions<P extends RouteParams = RouteParams> extends BaseHistoryActions<P> {
  private _unlistenHistory: UnregisterCallback;

  private _timer: number = 0;

  constructor(public nativeHistory: WebNativeHistory, public homeUrl: string, public routeConfig: RouteConfig, public maxLength: number, public locationMap?: LocationMap) {
    super(nativeHistory, homeUrl, routeConfig, maxLength, locationMap);
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

  destroy() {
    this._unlistenHistory();
  }
}

export function createRouter(createHistory: 'Browser' | 'Hash' | 'Memory' | string, homeUrl: string, routeConfig: RouteConfig, locationMap?: LocationMap) {
  const nativeHistory = new WebNativeHistory(createHistory);
  const historyActions = new HistoryActions(nativeHistory, homeUrl, routeConfig, 10, locationMap);
  nativeHistory.actions = historyActions;
  historyActions.relaunch(nativeHistory.initLocation);
  return historyActions;
}
