import {config, ModuleGetter, ReturnModule, RootState as CoreRootState} from '@medux/core';
import {compilePath} from './matchPath';

export type HistoryAction = 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
export interface Location {
  url: string;
  pathname: string;
  search: string;
  hash: string;
  action: HistoryAction;
  key: string;
}
export type RouteParams = {[moduleName: string]: {[key: string]: any} | undefined};
/**
 * 描述当前路由展示了哪些模块的哪些view，例如：
 * ```
 * {
 *    app: {
 *        Main: true,
 *        List: true
 *    },
 *    article: {
 *        Details: true
 *    }
 * }
 * ```
 */
export interface DisplayViews {
  [moduleName: string]: {[viewName: string]: boolean | undefined} | undefined;
}
export interface RouteData<P extends RouteParams = any> {
  /**
   * 表示当前路由下加载了哪些views
   */
  views: DisplayViews;
  /**
   * 表示当前路由传递了哪些参数
   */
  params: P;
  /**
   * 表示当前路由下加载views的父子嵌套关系
   */
  paths: string[];
  /**
   * 路由的打开方式
   */
  action: HistoryAction;
  key: string;
}
/**
 * Redux中保存的路由数据结构
 */
export type RouteState<P extends RouteParams = RouteParams> = Location &
  RouteData<P> & {
    /**
     * 路由记录
     */
    history: string[];
    /**
     * pathname记录
     */
    stack: string[];
  };

type MountViews<M extends any> = {[key in keyof M['views']]?: boolean};
type ModuleParams<M extends any> = M['model']['initState']['routeParams'];

export type RouteViews<G extends ModuleGetter> = {[key in keyof G]?: MountViews<ReturnModule<G[key]>>};
/**
 * 整个Store的数据结构模型，主要分为三部分
 * - route，路由数据
 * - modules，各个模块的数据，可通过isModule辨别
 * - otherReducers，其他第三方reducers生成的数据
 */
export type RootState<G extends ModuleGetter> = {
  route: {
    history: string[];
    stack: string[];
    url: string;
    pathname: string;
    search: string;
    hash: string;
    views: {[key in keyof G]?: MountViews<ReturnModule<G[key]>>};
    params: {[key in keyof G]?: ModuleParams<ReturnModule<G[key]>>};
    paths: string[];
    key: string;
    action: HistoryAction;
  };
} & CoreRootState<G>;

export const routeConfig = {
  RSP: '|',
  escape: true,
  dateParse: false,
  splitKey: 'q',
  historyMax: 10,
  homeUrl: '/',
};

/**
 * 可以配置的参数
 * - escape 是否对生成的url进行escape编码
 * - dateParse 是否自动解析url中的日期格式
 * - splitKey 使用一个key来作为数据的载体
 * - defaultRouteParams 默认的路由参数
 */
export function setRouteConfig(conf: {RSP?: string; escape?: boolean; dateParse?: boolean; splitKey?: string; historyMax?: number; homeUrl?: string}) {
  conf.RSP !== undefined && (routeConfig.RSP = conf.RSP);
  conf.escape !== undefined && (routeConfig.escape = conf.escape);
  conf.dateParse !== undefined && (routeConfig.dateParse = conf.dateParse);
  conf.splitKey && (routeConfig.splitKey = conf.splitKey);
  conf.historyMax && (routeConfig.historyMax = conf.historyMax);
  conf.homeUrl && (routeConfig.homeUrl = conf.homeUrl);
}

export const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `medux${config.NSP}RouteChange`,
  BeforeRouteChange: `medux${config.NSP}BeforeRouteChange`,
};

export function beforeRouteChangeAction(routeState: RouteState) {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState],
  };
}

export function routeChangeAction(routeState: RouteState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState],
  };
}

export function routeParamsAction(moduleName: string, params: any, action: HistoryAction) {
  return {
    type: `${moduleName}${config.NSP}${RouteActionTypes.MRouteParams}`,
    payload: [params, action],
  };
}
export interface PaRouteData<P extends RouteParams = RouteParams> {
  views: DisplayViews;
  params: P;
  paths: string[];
}
export interface PaLocation {
  pathname: string;
  search: string;
  hash: string;
}
export interface LocationPayload {
  pathname: string;
  search?: string;
  hash?: string;
}
type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

export interface RoutePayload<P extends RouteParams = RouteParams> {
  paths: string[] | string;
  params?: DeepPartial<P>;
  extendParams?: DeepPartial<P>;
}

export function dataIsLocation(data: RoutePayload | LocationPayload): data is LocationPayload {
  return !!data['pathname'];
}
export function checkLocation(location: LocationPayload): PaLocation {
  const data: PaLocation = {...location} as any;
  data.pathname = `/${data.pathname}`.replace(/\/+/g, '/');
  if (data.pathname !== '/') {
    data.pathname = data.pathname.replace(/\/$/, '');
  }

  data.search = `?${location.search || ''}`.replace('??', '?');
  data.hash = `#${location.hash || ''}`.replace('##', '#');
  if (data.search === '?') {
    data.search = '';
  }
  if (data.hash === '#') {
    data.hash = '';
  }
  return data;
}
export function urlToLocation(url: string): PaLocation {
  url = `/${url}`.replace(/\/+/g, '/');
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
    search: search && `?${search}`,
    hash: hash && `#${hash}`,
  };
}

export function locationToUrl(safeLocation: PaLocation): string {
  return safeLocation.pathname + safeLocation.search + safeLocation.hash;
}

/**
 * 定义一个路由配置文件的结构
 */
export interface RouteRule {
  [path: string]: string | [string, RouteRule];
}

// 预先编译routeConfig，得到viewToRule及ruleToKeys
export function compileRule(routeRule: RouteRule, parentAbsoluteViewName = '', viewToRule: {[viewName: string]: string} = {}, ruleToKeys: {[rule: string]: (string | number)[]} = {}) {
  // ruleToKeys将每条rule中的params key解析出来
  for (const rule in routeRule) {
    if (routeRule.hasOwnProperty(rule)) {
      const item = routeRule[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;
      if (!ruleToKeys[rule]) {
        const {keys} = compilePath(rule, {end: true, strict: false, sensitive: false});
        ruleToKeys[rule] = keys.reduce((prev: (string | number)[], cur) => {
          prev.push(cur.name);
          return prev;
        }, []);
      }
      const absoluteViewName = `${parentAbsoluteViewName}/${viewName}`;
      viewToRule[absoluteViewName] = rule;
      if (pathConfig) {
        compileRule(pathConfig, absoluteViewName, viewToRule, ruleToKeys);
      }
    }
  }
  return {viewToRule, ruleToKeys};
}
