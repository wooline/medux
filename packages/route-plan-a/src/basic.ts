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

export interface Location<P extends RootParams = RootParams> {
  tag: string;
  params: Partial<P>;
}

export type RouteState<P extends RootParams, NL extends NativeLocation = NativeLocation> = Location<P> &
  NL & {
    action: HistoryAction;
    key: string;
  };

export type RouteRootState<P extends RootParams, NL extends NativeLocation = NativeLocation> = CoreRootState & {
  route: RouteState<P, NL>;
};

export type RootState<A extends RootModuleFacade, P extends RootParams, NL extends NativeLocation = NativeLocation> = {
  route: RouteState<P, NL>;
} & {[M in keyof A]?: A[M]['state']};

export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

export function extractNativeLocation<P extends RootParams, NL extends NativeLocation>(routeState: RouteState<P, NL>): NL {
  const data = {...routeState};
  ['tag', 'params', 'action', 'key'].forEach((key) => {
    delete data[key];
  });
  return data;
}
export interface RoutePayload<P extends RootParams = RootParams> {
  tag?: string;
  params?: DeepPartial<P>;
  extendParams?: P | true;
}

function locationToUri(location: Location, key: string): {uri: string; tag: string; query: string; key: string} {
  const {tag, params} = location;
  const query = params ? JSON.stringify(params) : '';
  return {uri: [key, tag, query].join(routeConfig.RSP), tag, query, key};
}

function splitUri(uri: string): [string, string, string];
function splitUri(uri: string, name: 'key' | 'tag' | 'query'): string;
function splitUri(...args: any): [string, string, string] | string {
  const [uri = '', name] = args;
  const arr = uri.split(routeConfig.RSP, 3);
  const index = {key: 0, tag: 1, query: 2};
  if (name) {
    return arr[index[name]];
  }
  return arr as any;
}
export function uriToLocation<P extends RootParams>(uri: string): {key: string; location: Location<P>} {
  const [key, tag, query] = splitUri(uri);
  const location: Location<P> = {tag, params: JSON.parse(query)};
  return {key, location};
}

interface HistoryRecord {
  uri: string;
  tag: string;
  query: string;
  key: string;
  sub: History;
}
export class History {
  groupMax: number = 10;

  actionsMax: number = 10;

  private groups: HistoryRecord[] = [];

  private actions: HistoryRecord[] = [];

  getAction(keyOrIndex?: number | string): HistoryRecord | undefined {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }
    if (typeof keyOrIndex === 'number') {
      return this.actions[keyOrIndex];
    }
    return this.actions.find((item) => item.key === keyOrIndex);
  }

  getGroup(keyOrIndex?: number | string): HistoryRecord | undefined {
    if (keyOrIndex === undefined) {
      keyOrIndex = 0;
    }
    if (typeof keyOrIndex === 'number') {
      return this.groups[keyOrIndex];
    }
    return this.groups.find((item) => item.key === keyOrIndex);
  }

  getActionIndex(key: string): number {
    return this.actions.findIndex((item) => item.key === key);
  }

  getGroupIndex(key: string): number {
    return this.groups.findIndex((item) => item.key === key);
  }

  getCurrentInternalHistory(): History {
    return this.actions[0].sub;
  }

  findTag(tag: string) {}

  getUriStack(): {actions: string[]; groups: string[]} {
    return {actions: this.actions.map((item) => item.uri), groups: this.groups.map((item) => item.uri)};
  }

  push(location: Location, key: string) {
    const {uri, tag, query} = locationToUri(location, key);
    const newStack: HistoryRecord = {uri, tag, query, key, sub: new History()};
    const groups = [...this.groups];
    const actions = [...this.actions];
    const actionsMax = this.actionsMax;
    const groupMax = this.groupMax;
    actions.unshift(newStack);
    if (actions.length > actionsMax) {
      actions.length = actionsMax;
    }
    if (splitUri(groups[0]?.uri, 'tag') !== tag) {
      groups.unshift(newStack);
      if (groups.length > groupMax) {
        groups.length = groupMax;
      }
    } else {
      groups[0] = newStack;
    }
    this.actions = actions;
    this.groups = groups;
  }

  replace(location: Location, key: string) {
    const {uri, tag, query} = locationToUri(location, key);
    const newStack: HistoryRecord = {uri, tag, query, key, sub: new History()};
    const groups = [...this.groups];
    const actions = [...this.actions];
    const groupMax = this.groupMax;
    actions[0] = newStack;
    groups[0] = newStack;
    if (tag === splitUri(groups[1]?.uri, 'tag')) {
      groups.splice(1, 1);
    }
    if (groups.length > groupMax) {
      groups.length = groupMax;
    }
    this.actions = actions;
    this.groups = groups;
  }

  relaunch(location: Location, key: string) {
    const {uri, tag, query} = locationToUri(location, key);
    const newStack: HistoryRecord = {uri, tag, query, key, sub: new History()};
    const actions: HistoryRecord[] = [newStack];
    const groups: HistoryRecord[] = [newStack];
    this.actions = actions;
    this.groups = groups;
  }

  pop(n: number) {
    const historyRecord = this.getGroup(n);
    if (!historyRecord) {
      return false;
    }
    const groups = [...this.groups];
    const actions: HistoryRecord[] = [];
    groups.splice(0, n);
    this.actions = actions;
    this.groups = groups;
    return true;
  }

  back(n: number) {
    const historyRecord = this.getAction(n);
    if (!historyRecord) {
      return false;
    }
    const uri = historyRecord.uri;
    const tag = splitUri(uri, 'tag');
    const groups = [...this.groups];
    const actions = [...this.actions];
    const deleteActions = actions.splice(0, n + 1, historyRecord);
    // 对删除的actions按tag合并
    const arr = deleteActions.reduce((pre: string[], curStack) => {
      const ctag = splitUri(curStack.uri, 'tag');
      if (pre[pre.length - 1] !== ctag) {
        pre.push(ctag);
      }
      return pre;
    }, []);

    if (arr[arr.length - 1] === splitUri(actions[1]?.uri, 'tag')) {
      arr.pop();
    }
    groups.splice(0, arr.length, historyRecord);
    if (tag === splitUri(groups[1]?.uri, 'tag')) {
      groups.splice(1, 1);
    }
    this.actions = actions;
    this.groups = groups;
    return true;
  }
}
