/* eslint-disable @typescript-eslint/no-use-before-define */
import {BaseHistoryActions, NativeHistory} from '@medux/route-plan-a';
// import {History, createBrowserHistory, createHashHistory, createMemoryHistory, Location as HistoryLocation} from 'history';
import {env, RootModuleFacade} from '@medux/core';

import type {RootState as BaseRootState, RootParams, RouteState as BaseRouteState, LocationTransform as BaseLocationTransform, WebNativeLocation} from '@medux/route-plan-a';

export type RouteState<P extends RootParams> = BaseRouteState<P, WebNativeLocation>;
export type RootState<A extends RootModuleFacade, P extends RootParams> = BaseRootState<A, P, WebNativeLocation>;
export type LocationTransform<P extends RootParams> = BaseLocationTransform<P, WebNativeLocation>;

export interface History {}

// function locationToUrl(loaction: PaLocation): string {
//   return loaction.pathname + loaction.search + loaction.hash;
// }
export class WebNativeHistory implements NativeHistory<WebNativeLocation> {
  public history: History;

  constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string) {
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

  getUrl() {
    const {pathname = '', search = '', hash = ''} = this.history.location;
    return [pathname, search, hash].join('');
  }

  getKey(location: HistoryLocation): string {
    return (location.state || '') as string;
  }

  getInitLocation(): WebNativeLocation {
    const {pathname = '', search = '', hash = ''} = this.history.location;
    return {pathname, search: decodeURIComponent(search).replace('?', ''), hash: decodeURIComponent(hash).replace('#', '')};
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

  push(location: WebNativeLocation, key: string): void {}

  replace(location: WebNativeLocation, key: string): void {}

  relaunch(location: WebNativeLocation, key: string): void {}

  pop(location: WebNativeLocation, n: number, key: string): void {}
}
export class HistoryActions<P extends RootParams = RootParams> extends BaseHistoryActions<P, WebNativeLocation> {
  constructor(protected nativeHistory: WebNativeHistory, locationTransform: LocationTransform<P>) {
    super(nativeHistory, locationTransform);
  }

  getNativeHistory() {
    return this.nativeHistory.history;
  }

  destroy() {}

  refresh() {
    this.nativeHistory.history.go(0);
  }
}

export function createRouter<P extends RootParams = RootParams>(locationTransform: LocationTransform<P>) {
  const nativeHistory = new WebNativeHistory(createHistory);
  const historyActions = new HistoryActions(nativeHistory, locationTransform);
  return historyActions;
}
