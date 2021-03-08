import {CoreRootState, RootModuleFacade} from '@medux/core';

export const routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  pagenames: {} as {[key: string]: string},
  defaultParams: {} as any,
  disableNativeRoute: false,
  indexUrl: '',
};

export function setRouteConfig(conf: {actionMaxHistory?: number; pagesMaxHistory?: number; indexUrl?: string; pagenames?: {[key: string]: string}; disableNativeRoute?: boolean}) {
  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
  conf.disableNativeRoute && (routeConfig.disableNativeRoute = true);
  conf.pagenames && (routeConfig.pagenames = conf.pagenames);
  conf.indexUrl && (routeConfig.indexUrl = conf.indexUrl);
}

export type HistoryAction = 'PUSH' | 'BACK' | 'POP' | 'REPLACE' | 'RELAUNCH';

export type ModuleParams = {[key: string]: any};
export type RootParams = {[moduleName: string]: ModuleParams};

export interface NativeLocation {
  pathname: string;
  searchData?: {[key: string]: string};
  hashData?: {[key: string]: string};
}

export interface Location<P extends RootParams = {}> {
  pagename: string;
  params: Partial<P>;
}
export interface PayloadLocation<P extends RootParams = {}, N extends string = string> {
  pagename?: N;
  params?: DeepPartial<P>;
  extendParams?: DeepPartial<P> | 'current';
}
export interface PartialLocation<P extends RootParams = {}> {
  pagename: string;
  params: DeepPartial<P>;
}

export type RouteState<P extends RootParams = {}> = Location<P> & {
  action: HistoryAction;
  key: string;
};

export type RouteRootState<P extends {[key: string]: any}> = CoreRootState & {
  route: RouteState<P>;
};

export type RootState<A extends RootModuleFacade, P extends {[key: string]: any}> = {
  route: RouteState<P>;
} & {[M in keyof A]?: A[M]['state']};

export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

function splitQuery(query: string): {[key: string]: string} | undefined {
  return (query || '').split('&').reduce((params, str) => {
    const sections = str.split('=');
    if (sections.length > 1) {
      const [key, ...arr] = sections;
      if (!params) {
        params = {};
      }
      params[key] = decodeURIComponent(arr.join('='));
    }
    return params;
  }, undefined as {[key: string]: string} | undefined);
}
function joinQuery(params: {[key: string]: string} | undefined): string {
  return Object.keys(params || {})
    .map((key) => `${key}=${encodeURIComponent((params as any)[key])}`)
    .join('&');
}
export function nativeUrlToNativeLocation(url: string): NativeLocation {
  if (!url) {
    return {
      pathname: '/',
      searchData: undefined,
      hashData: undefined,
    };
  }
  const arr = url.split(/[?#]/);
  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }
  const [path, search, hash] = arr;
  return {
    pathname: `/${path.replace(/^\/+|\/+$/g, '')}`,
    searchData: splitQuery(search),
    hashData: splitQuery(hash),
  };
}

export function nativeLocationToNativeUrl({pathname, searchData, hashData}: NativeLocation): string {
  const search = joinQuery(searchData);
  const hash = joinQuery(hashData);
  return [`/${pathname.replace(/^\/+|\/+$/g, '')}`, search && `?${search}`, hash && `#${hash}`].join('');
}
function locationToUri(location: Location, key: string): {uri: string; pagename: string; query: string; key: string} {
  const {pagename, params} = location;
  const query = params ? JSON.stringify(params) : '';
  return {uri: [key, pagename, query].join('|'), pagename, query, key};
}

function splitUri(uri: string): [string, string, string];
function splitUri(uri: string, name: 'key' | 'pagename' | 'query'): string;
function splitUri(...args: any): [string, string, string] | string {
  const [uri = '', name] = args;
  const [key, pagename, ...others] = uri.split('|');
  const arr = [key, pagename, others.join('|')];
  const index = {key: 0, pagename: 1, query: 2};
  if (name) {
    return arr[index[name]];
  }
  return arr as any;
}
export function uriToLocation<P extends {[key: string]: any}>(uri: string): {key: string; location: Location<P>} {
  const [key, pagename, query] = splitUri(uri);
  const location: Location<P> = {pagename, params: JSON.parse(query)};
  return {key, location};
}

interface HistoryRecord {
  uri: string;
  pagename: string;
  query: string;
  key: string;
  sub: History;
}
export class History {
  private pages: HistoryRecord[] = [];

  private actions: HistoryRecord[] = [];

  getActionRecord(keyOrIndex?: number | string): HistoryRecord | undefined {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }
    if (typeof keyOrIndex === 'number') {
      return this.actions[keyOrIndex];
    }
    return this.actions.find((item) => item.key === keyOrIndex);
  }

  getPageRecord(keyOrIndex?: number | string): HistoryRecord | undefined {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }
    if (typeof keyOrIndex === 'number') {
      return this.pages[keyOrIndex];
    }
    return this.pages.find((item) => item.key === keyOrIndex);
  }

  getActionIndex(key: string): number {
    return this.actions.findIndex((item) => item.key === key);
  }

  getPageIndex(key: string): number {
    return this.pages.findIndex((item) => item.key === key);
  }

  getCurrentInternalHistory(): History {
    return this.actions[0].sub;
  }

  getUriStack(): {actions: string[]; pages: string[]} {
    return {actions: this.actions.map((item) => item.uri), pages: this.pages.map((item) => item.uri)};
  }

  push(location: Location, key: string) {
    const {uri, pagename, query} = locationToUri(location, key);
    const newStack: HistoryRecord = {uri, pagename, query, key, sub: new History()};
    const pages = [...this.pages];
    const actions = [...this.actions];
    const actionsMax = routeConfig.actionMaxHistory;
    const pagesMax = routeConfig.pagesMaxHistory;
    actions.unshift(newStack);
    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }
    if (splitUri(pages[0]?.uri, 'pagename') !== pagename) {
      pages.unshift(newStack);
      if (pages.length > pagesMax) {
        pages.length = pagesMax;
      }
    } else {
      pages[0] = newStack;
    }
    this.actions = actions;
    this.pages = pages;
  }

  replace(location: Location, key: string) {
    const {uri, pagename, query} = locationToUri(location, key);
    const newStack: HistoryRecord = {uri, pagename, query, key, sub: new History()};
    const pages = [...this.pages];
    const actions = [...this.actions];
    const pagesMax = routeConfig.pagesMaxHistory;
    actions[0] = newStack;
    pages[0] = newStack;
    if (pagename === splitUri(pages[1]?.uri, 'pagename')) {
      pages.splice(1, 1);
    }
    if (pages.length > pagesMax) {
      pages.length = pagesMax;
    }
    this.actions = actions;
    this.pages = pages;
  }

  relaunch(location: Location, key: string) {
    const {uri, pagename, query} = locationToUri(location, key);
    const newStack: HistoryRecord = {uri, pagename, query, key, sub: new History()};
    const actions: HistoryRecord[] = [newStack];
    const pages: HistoryRecord[] = [newStack];
    this.actions = actions;
    this.pages = pages;
  }

  pop(n: number) {
    const historyRecord = this.getPageRecord(n);
    if (!historyRecord) {
      return false;
    }
    const pages = [...this.pages];
    const actions: HistoryRecord[] = [];
    pages.splice(0, n);
    this.actions = actions;
    this.pages = pages;
    return true;
  }

  back(n: number) {
    const historyRecord = this.getActionRecord(n);
    if (!historyRecord) {
      return false;
    }
    const uri = historyRecord.uri;
    const pagename = splitUri(uri, 'pagename');
    const pages = [...this.pages];
    const actions = [...this.actions];
    const deleteActions = actions.splice(0, n + 1, historyRecord);
    // 对删除的actions按tag合并
    const arr = deleteActions.reduce((pre: string[], curStack) => {
      const ctag = splitUri(curStack.uri, 'pagename');
      if (pre[pre.length - 1] !== ctag) {
        pre.push(ctag);
      }
      return pre;
    }, []);

    if (arr[arr.length - 1] === splitUri(actions[1]?.uri, 'pagename')) {
      arr.pop();
    }
    pages.splice(0, arr.length, historyRecord);
    if (pagename === splitUri(pages[1]?.uri, 'pagename')) {
      pages.splice(1, 1);
    }
    this.actions = actions;
    this.pages = pages;
    return true;
  }
}
