/* eslint-disable @typescript-eslint/no-use-before-define */
import {BaseHistoryActions, NativeHistory} from '@medux/route-plan-a';
import {History, createBrowserHistory, createHashHistory, createMemoryHistory, Location as HistoryLocation} from 'history';
import {env, RootModuleFacade} from '@medux/core';

import type {RootState as BaseRootState, RootParams, RouteState as BaseRouteState, LocationTransform as BaseLocationTransform, WebNativeLocation} from '@medux/route-plan-a';

export type RouteState<P extends RootParams> = BaseRouteState<P, WebNativeLocation>;
export type RootState<A extends RootModuleFacade, P extends RootParams> = BaseRootState<A, P, WebNativeLocation>;
export type LocationTransform<P extends RootParams> = BaseLocationTransform<P, WebNativeLocation>;

type UnregisterCallback = () => void;

// function locationToUrl(loaction: PaLocation): string {
//   return loaction.pathname + loaction.search + loaction.hash;
// }
export class WebNativeHistory implements NativeHistory<WebNativeLocation> {
  public history: History<never>;

  constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string) {
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

  getLocation(): WebNativeLocation {
    const {pathname = '', search = '', hash = ''} = this.history.location;
    return {pathname, search: decodeURIComponent(search).replace('?', ''), hash: decodeURIComponent(hash).replace('#', '')};
  }

  getUrl() {
    const {pathname = '', search = '', hash = ''} = this.history.location;
    return [pathname, search, hash].join('');
  }

  parseUrl(url: string): WebNativeLocation {
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
    const [pathname, search = '', hash = ''] = arr;

    return {
      pathname,
      search,
      hash,
    };
  }

  toUrl(location: WebNativeLocation): string {
    return [location.pathname, location.search && `?${location.search}`, location.hash && `#${location.hash}`].join('');
  }

  block(blocker: (url: string, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => false | void) {
    return this.history.block((location, action) => {
      const {pathname = '', search = '', hash = ''} = location;
      return blocker([pathname, search, hash].join(''), this.getKey(location), action);
    });
  }

  getKey(location: HistoryLocation): string {
    return (location.state || '') as string;
  }

  push(location: WebNativeLocation, key: string): void {
    this.history.push(this.toUrl(location), key as any);
  }

  replace(location: WebNativeLocation, key: string): void {
    this.history.replace(this.toUrl(location), key as any);
  }

  relaunch(location: WebNativeLocation, key: string): void {
    this.history.push(this.toUrl(location), key as any);
  }

  pop(location: WebNativeLocation, n: number, key: string): void {
    if (n < 500) {
      this.history.go(-n);
    } else {
      this.history.push(this.toUrl(location), key as any);
    }
  }
}
export class HistoryActions<P extends RootParams = RootParams> extends BaseHistoryActions<P, WebNativeLocation> {
  private _unlistenHistory: UnregisterCallback;

  private _timer: number = 0;

  constructor(protected nativeHistory: WebNativeHistory, locationTransform: LocationTransform<P>) {
    super(nativeHistory, locationTransform);
    this._unlistenHistory = this.nativeHistory.block((url, key, action) => {
      if (key !== this.getCurKey()) {
        let callback: (() => void) | undefined;
        let index: number = 0;
        if (action === 'POP') {
          index = this.findHistoryByKey(key);
        }
        if (index > 0) {
          callback = () => {
            this._timer = 0;
            this.pop(index);
          };
        } else if (action === 'REPLACE') {
          callback = () => {
            this._timer = 0;
            this.replace(url);
          };
        } else if (action === 'PUSH') {
          callback = () => {
            this._timer = 0;
            this.push(url);
          };
        } else {
          callback = () => {
            this._timer = 0;
            this.relaunch(url);
          };
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

export function createRouter<P extends RootParams = RootParams>(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationTransform: LocationTransform<P>) {
  const nativeHistory = new WebNativeHistory(createHistory);
  const historyActions = new HistoryActions(nativeHistory, locationTransform);
  return historyActions;
}
