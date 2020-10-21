/* eslint-disable @typescript-eslint/no-use-before-define */
import {DisplayViews, HistoryProxy, RouteData, RouteParams, config as coreConfig} from '@medux/core';
import {checkLocation, checkPathname, checkUrl, safelocationToUrl, safeurlToLocation} from './utils';
import {compilePath, compileToPath, matchPath} from './matchPath';

import assignDeep from './deep-extend';

export {checkUrl, checkLocation, safeurlToLocation, safelocationToUrl} from './utils';

/**
 * medux内部使用的Location数据结构，比浏览器的Location相比多了action属性，少了state属性，所以在此路由方案中不能使用history state
 */
export interface MeduxLocation {
  pathname: string;
  search: string;
  hash: string;
  action?: string;
}

export interface LocationPayload {
  pathname: string;
  search?: string;
  hash?: string;
  action?: string;
}
export interface RoutePayload<P extends RouteParams> {
  paths: string[] | string;
  params?: DeepPartial<P>;
  action?: string;
  extend?: RouteData<P>;
}
function dataIsLocation(data: LocationPayload | RoutePayload<any>): data is LocationPayload {
  return !!data['pathname'];
}
/**
 * 定义一个浏览器的Location与medux内部使用的RouteData相互转换器
 */
export interface TransformRoute<P extends RouteParams = any> {
  locationToRoute: (location: MeduxLocation) => RouteData<P>;
  routeToLocation: (paths: string[] | string, params?: P, action?: string) => MeduxLocation;
  payloadToLocation: (payload: LocationPayload | RoutePayload<P>) => MeduxLocation;
  urlToLocation: (url: string) => MeduxLocation;
}

/**
 * 一个深度拷贝的方法
 */
export const deepAssign = assignDeep;

const config = {
  escape: true,
  dateParse: false,
  splitKey: 'q',
  defaultRouteParams: {},
};

/**
 * 可以配置的参数
 * - escape 是否对生成的url进行escape编码
 * - dateParse 是否自动解析url中的日期格式
 * - splitKey 使用一个key来作为数据的载体
 * - defaultRouteParams 默认的路由参数
 */
export function setRouteConfig(conf: {escape?: boolean; dateParse?: boolean; splitKey?: string; defaultRouteParams?: {[moduleName: string]: any}}) {
  conf.escape !== undefined && (config.escape = conf.escape);
  conf.dateParse !== undefined && (config.dateParse = conf.dateParse);
  conf.splitKey && (config.splitKey = conf.splitKey);
  conf.defaultRouteParams && (config.defaultRouteParams = conf.defaultRouteParams);
}

// 排除默认路由参数，路由中如果参数值与默认参数相同可省去
// 如果最终moduleParams为空{}，能不能省去：
// @param holde 如果paths中存在，则可以安全去掉，因为反解析时会自动补上，否则不能去掉
function excludeDefaultData(data: {[moduleName: string]: any}, def: {[moduleName: string]: any}, holde: boolean, views?: {[moduleName: string]: any}) {
  const result: any = {};
  Object.keys(data).forEach((moduleName) => {
    let value = data[moduleName];
    const defaultValue = def[moduleName];
    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && typeof value === 'object' && !Array.isArray(value)) {
        value = excludeDefaultData(value, defaultValue, !!views && !views[moduleName]);
      }
      if (value !== undefined) {
        result[moduleName] = value;
      }
    }
  });

  if (Object.keys(result).length === 0 && !holde) {
    return undefined;
  }
  return result;
}

/**
 * 定义一个路由配置文件的结构
 */
export interface RouteConfig {
  [path: string]: string | [string, RouteConfig];
}

const ISO_DATE_FORMAT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;

function dateParse(prop: any, value: any) {
  if (typeof value === 'string' && ISO_DATE_FORMAT.test(value)) {
    return new Date(value);
  }
  return value;
}

/*
  将字符串变成 Data，因为 JSON 中没有 Date 类型，所以用正则表达式匹配自动转换
*/
function searchParse(search: string): {[moduleName: string]: {[key: string]: any}} {
  if (!search) {
    return {};
  }
  if (config.escape) {
    search = unescape(search);
  }
  try {
    return JSON.parse(search, config.dateParse ? dateParse : undefined);
  } catch (error) {
    return {};
  }
}

// 将参数序列化为string
function searchStringify(searchData: any): string {
  if (typeof searchData !== 'object') {
    return '';
  }
  const str = JSON.stringify(searchData);
  if (str === '{}') {
    return '';
  }
  if (config.escape) {
    return escape(str);
  }
  return str;
}

function splitSearch(search: string) {
  const reg = new RegExp(`[?&#]${config.splitKey}=([^&]+)`);
  const arr = search.match(reg);
  if (arr) {
    return searchParse(arr[1]);
  }
  return {};
}

// 将{"aa.bb.cc":1}转换为{aa:{bb:{cc:1}}}
function checkPathArgs(params: {[key: string]: string}): {[key: string]: any} {
  const obj = {};
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const val = params[key];
      const props = key.split('.');
      if (props.length > 1) {
        props.reduce((prev, cur, index, arr) => {
          if (index === arr.length - 1) {
            prev[cur] = val;
          } else {
            prev[cur] = {};
          }
          return prev[cur];
        }, obj);
      } else {
        obj[key] = val;
      }
    }
  }
  return obj;
}
// 将routeConfig逐层匹配pathname，可以得到viewPaths和pathArgs
function pathnameParse(pathname: string, routeConfig: RouteConfig, paths: string[], args: {[moduleName: string]: {[key: string]: any} | undefined}) {
  for (const rule in routeConfig) {
    if (routeConfig.hasOwnProperty(rule)) {
      const item = routeConfig[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;
      const match = matchPath(pathname, {path: rule.replace(/\$$/, ''), exact: !pathConfig});
      // const match = matchPath(pathname, {path: rule.replace(/\$$/, ''), exact: rule.endsWith('$')});
      if (match) {
        paths.push(viewName);
        const moduleName = viewName.split(coreConfig.VSP)[0];
        const {params} = match;
        if (params && Object.keys(params).length > 0) {
          args[moduleName] = Object.assign(args[moduleName] || {}, checkPathArgs(params));
        }
        if (pathConfig) {
          pathnameParse(pathname, pathConfig, paths, args);
        }
        return;
      }
    }
  }
}
// 预先编译routeConfig，得到viewToRule及ruleToKeys
function compileConfig(routeConfig: RouteConfig, parentAbsoluteViewName = '', viewToRule: {[viewName: string]: string} = {}, ruleToKeys: {[rule: string]: (string | number)[]} = {}) {
  // ruleToKeys将每条rule中的params key解析出来
  for (const rule in routeConfig) {
    if (routeConfig.hasOwnProperty(rule)) {
      const item = routeConfig[rule];
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
        compileConfig(pathConfig, absoluteViewName, viewToRule, ruleToKeys);
      }
    }
  }
  return {viewToRule, ruleToKeys};
}

type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

/**
 * 为params加上默认值
 * 如果paths中包含某module，也加上默认值
 */
export function assignRouteData(paths: string[], params: {[moduleName: string]: any}, action?: string): RouteData {
  const views: DisplayViews = paths.reduce((prev: DisplayViews, cur) => {
    const [moduleName, viewName] = cur.split(coreConfig.VSP);
    if (moduleName !== '@' && viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }
      prev[moduleName]![viewName] = true;
      if (!params[moduleName]) {
        params[moduleName] = {};
      }
    }
    return prev;
  }, {});
  Object.keys(params).forEach((moduleName) => {
    params[moduleName] = assignDeep({}, config.defaultRouteParams[moduleName], params[moduleName]);
  });
  return {views, paths, params, action};
}

// 分离search和hash并且序列化为string
function extractHashData(params: {[moduleName: string]: any}) {
  const searchParams: {[moduleName: string]: any} = {};
  const hashParams: {[moduleName: string]: any} = {};
  for (const moduleName in params) {
    if (params[moduleName] && params.hasOwnProperty(moduleName)) {
      const data = params[moduleName]!;
      const keys = Object.keys(data);
      if (keys.length > 0) {
        keys.forEach((key) => {
          if (key.startsWith('_')) {
            if (!hashParams[moduleName]) {
              hashParams[moduleName] = {};
            }
            hashParams[moduleName][key] = data[key];
          } else {
            if (!searchParams[moduleName]) {
              searchParams[moduleName] = {};
            }
            searchParams[moduleName][key] = data[key];
          }
        });
      } else {
        searchParams[moduleName] = {};
      }
    }
  }
  return {
    search: searchStringify(searchParams),
    hash: searchStringify(hashParams),
  };
}

const cacheData: Array<{url: string; routeData: RouteData}> = [];

/**
 * 创建一个浏览器的Location与medux内部使用的RouteData相互转换器
 * @param 应用的路由配置文件
 * @returns 转换器
 */
export function buildTransformRoute<P extends RouteParams>(routeConfig: RouteConfig, getCurPathname: () => string): TransformRoute<P> {
  const {viewToRule, ruleToKeys} = compileConfig(routeConfig);

  const transformRoute: TransformRoute<P> = {
    locationToRoute(location) {
      const safeLocation = checkLocation(location, getCurPathname());
      const url = safelocationToUrl(safeLocation);
      const item = cacheData.find((val) => {
        return val && val.url === url;
      });
      if (item) {
        item.routeData.action = safeLocation.action;
        return item.routeData;
      }
      const pathname = safeLocation.pathname;
      const paths: string[] = [];
      const pathsArgs: {[moduleName: string]: {[key: string]: any}} = {};
      pathnameParse(pathname, routeConfig, paths, pathsArgs);
      const params = splitSearch(safeLocation.search);
      const hashParams = splitSearch(safeLocation.hash);
      assignDeep(params, hashParams);
      const routeData = assignRouteData(paths, assignDeep(pathsArgs, params), safeLocation.action);
      cacheData.unshift({url, routeData});
      cacheData.length = 100;
      return routeData;
    },
    routeToLocation(paths, params, action) {
      params = params || ({} as any);
      let pathname: string;
      let views: DisplayViews = {};
      if (typeof paths === 'string') {
        pathname = checkPathname(paths, getCurPathname());
      } else {
        const data = pathsToPathname(paths, params);
        pathname = data.pathname;
        params = data.params as P;
        views = data.views;
      }
      const paramsFilter = excludeDefaultData(params as any, config.defaultRouteParams, false, views);
      const {search, hash} = extractHashData(paramsFilter);
      const location: MeduxLocation = {
        pathname,
        search: search ? `?${config.splitKey}=${search}` : '',
        hash: hash ? `#${config.splitKey}=${hash}` : '',
        action,
      };
      return location;
    },
    payloadToLocation(payload) {
      if (dataIsLocation(payload)) {
        return checkLocation(payload, getCurPathname());
      }
      const params: P | undefined = payload.extend ? assignDeep({}, payload.extend.params, payload.params) : payload.params;
      const location = transformRoute.routeToLocation(payload.paths, params);
      return checkLocation(location, getCurPathname());
    },
    urlToLocation(url) {
      url = checkUrl(url, getCurPathname());
      return safeurlToLocation(url);
    },
  };

  /**
   * @param pathprops aa 或 aa.bb.cc
   */
  function getPathProps(pathprops: string | number, moduleParas: {[key: string]: any} = {}, deleteIt?: boolean) {
    let val: any;
    if (typeof pathprops === 'string' && pathprops.indexOf('.') > -1) {
      const props = pathprops.split('.');
      const len = props.length - 1;
      props.reduce((p, c, i) => {
        if (i === len) {
          val = p[c];
          deleteIt && delete p[c];
        }
        return p[c] || {};
      }, moduleParas);
    } else {
      val = moduleParas[pathprops];
      deleteIt && delete moduleParas[pathprops];
    }
    return val;
  }
  function pathsToPathname(paths: string[], params: RouteParams = {}) {
    // 将args深克隆，因为后面可能会删除path中使用到的变量
    const len = paths.length - 1;
    const paramsFilter: RouteParams = assignDeep({}, params);
    let pathname = '';
    const views: DisplayViews = {};
    paths.reduce((parentAbsoluteViewName, viewName, index) => {
      const [moduleName, view] = viewName.split(coreConfig.VSP);
      const absoluteViewName = `${parentAbsoluteViewName}/${viewName}`;
      const rule = viewToRule[absoluteViewName];
      const keys = ruleToKeys[rule] || [];
      if (moduleName !== '@' && view) {
        if (!views[moduleName]) {
          views[moduleName] = {};
        }
        views[moduleName]![view] = true;
      }
      // 最深的一个view可以决定pathname
      if (index === len) {
        // const toPath = compileToPath(rule.replace(/\$$/, ''));
        const toPath = compileToPath(rule);
        const args = keys.reduce((prev, cur) => {
          prev[cur] = getPathProps(cur, params[moduleName]);
          return prev;
        }, {});
        pathname = toPath(args);
      }
      // pathname中传递的值可以不在params中重复传递
      keys.forEach((key) => {
        getPathProps(key, paramsFilter[moduleName], true);
      });
      return absoluteViewName;
    }, '');
    return {pathname, views, params: paramsFilter};
  }

  return transformRoute;
}

export type LocationListener = (location: MeduxLocation) => void;
export type LocationBlocker = (location: MeduxLocation, curLocation: MeduxLocation) => void | Promise<void>;

export abstract class BaseHistoryActions implements HistoryProxy<MeduxLocation> {
  private _uid = 0;

  private _listenList: {[key: string]: LocationListener} = {};

  private _blockerList: {[key: string]: LocationBlocker} = {};

  protected _location: MeduxLocation;

  protected _startupLocation: MeduxLocation;

  constructor(location: MeduxLocation, public initialized: boolean, protected _transformRoute: TransformRoute<any>) {
    this._location = location;
    this._startupLocation = this._location;
  }

  equal(a: MeduxLocation, b: MeduxLocation): boolean {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.action === b.action;
  }

  getLocation(): MeduxLocation {
    return this._location;
  }

  getRouteData() {
    return this._transformRoute.locationToRoute(this.getLocation());
  }

  subscribe(listener: LocationListener): () => void {
    this._uid++;
    const uid = this._uid;
    this._listenList[uid] = listener;
    return () => {
      delete this._listenList[uid];
    };
  }

  block(listener: LocationBlocker): () => void {
    this._uid++;
    const uid = this._uid;
    this._blockerList[uid] = listener;
    return () => {
      delete this._blockerList[uid];
    };
  }

  locationToRouteData(location: MeduxLocation): RouteData<any> {
    return this._transformRoute.locationToRoute(location);
  }

  dispatch(location: MeduxLocation): Promise<void> {
    if (this.equal(location, this._location)) {
      return Promise.reject();
    }
    return Promise.all(Object.values(this._blockerList).map((fn) => fn(location, this._location))).then(() => {
      this._location = location;
      Object.values(this._listenList).forEach((listener) => listener(location));
    });
  }

  abstract patch(location: MeduxLocation, routeData: RouteData<any>): void;

  abstract destroy(): void;

  abstract passive(location: MeduxLocation): void;
}
