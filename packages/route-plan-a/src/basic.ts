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

export type HistoryAction = 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';

export type Params = {[moduleName: string]: {[key: string]: any} | undefined};

// export interface BaseLocation {
//   pathname: string;
//   search: string;
// }

export interface NativeLocation {
  pathname: string;
  search: string;
  hash: string;
}

export interface Location<P extends Params = Params> {
  tag: string;
  params: P;
}

export type RouteState<P extends Params = Params> = Location<P> & {
  pathname: string;
  search: string;
  hash: string;
  action: HistoryAction;
  key: string;
  history: string[];
  stack: string[];
};

export type RouteRootState<P extends Params = Params> = CoreRootState & {
  route: RouteState<P>;
};

export type RootState<A extends RootModuleFacade, P extends Params> = {
  route: RouteState<P>;
} & {[M in keyof A]?: A[M]['state']};

type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

export interface RoutePayload<P extends Params = Params> {
  tag?: string;
  params?: DeepPartial<P>;
  extendParams?: P | true;
}

export function locationToUri(location: Location, key: string): string {
  return [key, location.tag, JSON.stringify(location.params)].join(routeConfig.RSP);
}
function splitUri(uri: string): [string, string, string];
function splitUri(uri: string, name: 'key' | 'tag' | 'query'): string;
function splitUri(...args: any): [string, string, string] | string {
  const [uri, name] = args;
  const arr = uri.split(routeConfig.RSP, 3);
  const index = {key: 0, tag: 1, query: 2};
  if (name) {
    return arr[index[name]];
  }
  return arr as any;
}
export function uriToLocation<P extends Params = Params>(uri: string): {key: string; location: Location<P>} {
  const [key, tag, query] = splitUri(uri);
  const location: Location<P> = {tag, params: JSON.parse(query)};
  return {key, location};
}
export function buildHistoryStack(location: Location, action: HistoryAction, key: string, curData: {history: string[]; stack: string[]}): {history: string[]; stack: string[]} {
  const maxLength = routeConfig.historyMax;
  const tag = location.tag;
  const uri = locationToUri(location, key);
  const {history, stack} = curData;
  let historyList: string[] = [...history];
  let stackList: string[] = [...stack];
  if (action === 'RELAUNCH') {
    historyList = [uri];
    stackList = [uri];
  } else if (action === 'PUSH') {
    historyList.unshift(uri);
    if (historyList.length > maxLength) {
      historyList.length = maxLength;
    }
    if (splitUri(stackList[0], 'tag') !== tag) {
      stackList.unshift(uri);
      if (stackList.length > maxLength) {
        stackList.length = maxLength;
      }
    } else {
      stackList[0] = uri;
    }
  } else if (action === 'REPLACE') {
    historyList[0] = uri;
    stackList[0] = uri;
    if (tag === splitUri(stackList[1], 'tag')) {
      stackList.splice(1, 1);
    }
    if (stackList.length > maxLength) {
      stackList.length = maxLength;
    }
  } else if (action.startsWith('POP')) {
    const n = parseInt(action.replace('POP', ''), 10) || 1;
    const useStack = n > 1000;
    if (useStack) {
      historyList = [];
      stackList.splice(0, n - 1000);
    } else {
      const arr = historyList.splice(0, n + 1, uri).reduce((pre: string[], curUri) => {
        const ctag = splitUri(curUri, 'tag');
        if (pre[pre.length - 1] !== ctag) {
          pre.push(ctag);
        }
        return pre;
      }, []);
      if (arr[arr.length - 1] === splitUri(historyList[1], 'tag')) {
        arr.pop();
      }
      stackList.splice(0, arr.length, uri);
      if (tag === splitUri(stackList[1], 'tag')) {
        stackList.splice(1, 1);
      }
    }
  }
  return {history: historyList, stack: stackList};
}
