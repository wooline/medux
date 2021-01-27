import {CoreRootState, RootModuleFacade} from '@medux/core';

export const routeConfig = {
  RSP: '|',
  historyMax: 10,
  homeUri: '|home|{app:{}}',
};

/**
 * 可以配置的参数
 * - escape 是否对生成的url进行escape编码
 * - dateParse 是否自动解析url中的日期格式
 * - splitKey 使用一个key来作为数据的载体
 * - VSP 默认为. ModuleName${VSP}ViewName 用于路由ViewName的连接
 */
export function setRouteConfig(conf: {RSP?: string; historyMax?: number; homeUri?: string}) {
  conf.RSP !== undefined && (routeConfig.RSP = conf.RSP);
  conf.historyMax && (routeConfig.historyMax = conf.historyMax);
  conf.homeUri && (routeConfig.homeUri = conf.homeUri);
}

export type HistoryAction = 'PUSH' | 'BACK' | 'POP' | 'REPLACE' | 'RELAUNCH';

export type ModuleParams = {[key: string]: any};
export type RootParams = {[moduleName: string]: ModuleParams};

// export interface BaseLocation {
//   pathname: string;
//   search: string;
// }

export interface NativeLocation {
  pathname: string;
  search: string;
  hash: string;
}

export interface Location<P extends {[key: string]: any} = {}> {
  pagename: string;
  params: P;
}

export type RouteState<P extends {[key: string]: any} = {}, NL extends NativeLocation = NativeLocation> = Location<P> &
  NL & {
    action: HistoryAction;
    key: string;
  };

export type RouteRootState<P extends {[key: string]: any}, NL extends NativeLocation = NativeLocation> = CoreRootState & {
  route: RouteState<P, NL>;
};

export type RootState<A extends RootModuleFacade, P extends {[key: string]: any}, NL extends NativeLocation = NativeLocation> = {
  route: RouteState<P, NL>;
} & {[M in keyof A]?: A[M]['state']};

export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

export function extractNativeLocation<P extends {[key: string]: any}, NL extends NativeLocation>(routeState: RouteState<P, NL>): NL {
  const data = {...routeState};
  ['pagename', 'params', 'action', 'key'].forEach((key) => {
    delete data[key];
  });
  return data;
}
export interface RoutePayload<P extends RootParams = RootParams> {
  pagename?: string;
  params?: DeepPartial<P>;
  extendParams?: P | true;
}

function locationToUri(location: Location, key: string): {uri: string; pagename: string; query: string; key: string} {
  const {pagename, params} = location;
  const query = params ? JSON.stringify(params) : '';
  return {uri: [key, pagename, query].join(routeConfig.RSP), pagename, query, key};
}

function splitUri(uri: string): [string, string, string];
function splitUri(uri: string, name: 'key' | 'pagename' | 'query'): string;
function splitUri(...args: any): [string, string, string] | string {
  const [uri = '', name] = args;
  const arr = uri.split(routeConfig.RSP, 3);
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
  pagesMax: number = 10;

  actionsMax: number = 10;

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
    const actionsMax = this.actionsMax;
    const pagesMax = this.pagesMax;
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
    const pagesMax = this.pagesMax;
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
