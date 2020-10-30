/* eslint-disable @typescript-eslint/no-use-before-define */
import {DisplayViews, HistoryProxy, RouteState, RouteParams, RouteData, config as coreConfig, Location as BaseLocation, HistoryAction} from '@medux/core';
import {compilePath, compileToPath, matchPath} from './matchPath';

import assignDeep from './deep-extend';

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
export interface RoutePayload<P extends RouteParams = RouteParams> {
  paths: string[] | string;
  params?: DeepPartial<P>;
  extend?: RouteData<P>;
}
export interface Location extends BaseLocation {
  pathname: string;
  search: string;
  hash: string;
}
export interface NativeLocation {
  key: string;
  url: string;
}
function dataIsLocation(data: RoutePayload | LocationPayload): data is LocationPayload {
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
export function setRouteConfig(conf: {escape?: boolean; dateParse?: boolean; splitKey?: string; homeUrl?: string; defaultRouteParams?: {[moduleName: string]: any}}) {
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
export function assignRouteData(paths: string[], params: {[moduleName: string]: any}): PaRouteData {
  const views: DisplayViews = paths.reduce((prev: DisplayViews, cur) => {
    const [moduleName, viewName] = cur.split(coreConfig.VSP);
    if (moduleName && viewName) {
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
  return {views, paths, params};
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

const cacheData: Array<{url: string; routeData: PaRouteData}> = [];

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
function pathsToPathname(
  paths: string[],
  params: RouteParams = {},
  viewToRule: {
    [viewName: string]: string;
  },
  ruleToKeys: {
    [rule: string]: (string | number)[];
  }
) {
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
    if (moduleName && view) {
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

export type LocationListener<P extends RouteParams> = (routeState: RouteState<Location, P>) => void;
export type LocationBlocker<P extends RouteParams> = (location: Location, curLocation: Location | undefined, routeData: RouteData<P>, curRouteData: RouteData<P> | undefined) => void | Promise<void>;

export type LocationToLocation = (location: PaLocation) => PaLocation;
export type LocationMap = {in: LocationToLocation; out: LocationToLocation};
export interface NativeHistory {
  push(location: Location): void;
  replace(location: Location): void;
  relaunch(location: Location): void;
  pop(n: number): void;
}

export abstract class BaseHistoryActions<P extends RouteParams = RouteParams> implements HistoryProxy {
  private _tid = 0;

  private _uid = 0;

  private _RSP = '|';

  private _listenList: {[key: string]: LocationListener<P>} = {};

  private _blockerList: {[key: string]: LocationBlocker<P>} = {};

  private _location: Location | undefined;

  private _routeData: RouteData<P> | undefined;

  private _startupLocation: Location | undefined;

  private _startupRouteData: RouteData<P> | undefined;

  private _history: string[] = [];

  private _stack: string[] = [];

  private _viewToRule: {
    [viewName: string]: string;
  };

  private _ruleToKeys: {
    [rule: string]: (string | number)[];
  };

  constructor(private _homeUrl: string, public nativeHistory: NativeHistory, public routeConfig: RouteConfig, public locationMap?: LocationMap) {
    // if (locationMap && _locationMap) {
    //   _locationMap.in = (location) => checkLocation(locationMap.in(location), getCurPathname());
    //   _locationMap.out = (location) => checkLocation(locationMap.out(location), getCurPathname());
    // }
    const {viewToRule, ruleToKeys} = compileConfig(routeConfig);
    this._viewToRule = viewToRule;
    this._ruleToKeys = ruleToKeys;
  }

  init(initLocation: PaLocation) {
    return this.relaunch(this.locationMap ? this.locationMap.in(initLocation) : initLocation);
  }

  private _getCurKey(): string {
    return this.getLocation()?.key || '';
  }

  private _getCurPathname(): string {
    return this.getLocation()?.pathname || '';
  }

  getLocation(startup?: boolean): Location | undefined {
    return startup ? this._startupLocation : this._location;
  }

  getRouteData(startup?: boolean): RouteData<P> | undefined {
    return startup ? this._startupRouteData : this._routeData;
  }

  getRouteState(): RouteState<Location, P> | undefined {
    if (this._location) {
      return {history: this._history, stack: this._stack, location: this._location, data: this._routeData!};
    }
    return undefined;
  }

  locationToRoute(safeLocation: PaLocation): PaRouteData<P> {
    // const safeLocation = checkLocation(location, this._getCurPathname());
    const url = locationToUrl(safeLocation);
    const item = cacheData.find((val) => {
      return val && val.url === url;
    });
    if (item) {
      return item.routeData as PaRouteData<P>;
    }
    const pathname = safeLocation.pathname;
    const paths: string[] = [];
    const pathsArgs: {[moduleName: string]: {[key: string]: any}} = {};
    pathnameParse(pathname, this.routeConfig, paths, pathsArgs);
    const params = splitSearch(safeLocation.search);
    const hashParams = splitSearch(safeLocation.hash);
    assignDeep(params, hashParams);
    const routeData = assignRouteData(paths, assignDeep(pathsArgs, params));
    cacheData.unshift({url, routeData});
    cacheData.length = 100;
    return routeData as PaRouteData<P>;
  }

  routeToLocation(paths: string[] | string, params?: RouteParams): PaLocation {
    params = params || ({} as any);
    let pathname: string;
    let views: DisplayViews = {};
    if (typeof paths === 'string') {
      pathname = paths;
    } else {
      const data = pathsToPathname(paths, params, this._viewToRule, this._ruleToKeys);
      pathname = data.pathname;
      params = data.params;
      views = data.views;
    }
    const paramsFilter = excludeDefaultData(params as any, config.defaultRouteParams, false, views);
    const {search, hash} = extractHashData(paramsFilter);
    return {
      pathname,
      search: search ? `?${config.splitKey}=${search}` : '',
      hash: hash ? `#${config.splitKey}=${hash}` : '',
    };
  }

  payloadToRoute(data: RoutePayload<P>): PaRouteData<P> {
    const params: RouteParams | undefined = data.extend ? assignDeep({}, data.extend.params, data.params) : data.params;
    let paths: string[] = [];
    if (typeof data.paths === 'string') {
      const pathname = data.paths;
      pathnameParse(pathname, this.routeConfig, paths, {});
    } else {
      paths = data.paths;
    }
    return assignRouteData(paths, params || {}) as PaRouteData<P>;
  }

  payloadToLocation(data: RoutePayload<P> | LocationPayload | string): PaLocation {
    if (typeof data === 'string') {
      return urlToLocation(data);
    }
    if (dataIsLocation(data)) {
      return checkLocation(data);
    }
    const params: RouteParams | undefined = data.extend ? assignDeep({}, data.extend.params, data.params) : data.params;
    return this.routeToLocation(data.paths, params);
  }

  private _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  private _getEfficientLocation(safeLocation: PaLocation, curPathname: string): {location: PaLocation; routeData: PaRouteData<P>} {
    const routeData = this.locationToRoute(safeLocation);
    if (routeData.views['@']) {
      const url = Object.keys(routeData.views['@'])[0];
      const reLocation = urlToLocation(url);
      return this._getEfficientLocation(reLocation, safeLocation.pathname);
    }
    return {location: safeLocation, routeData};
  }

  private _buildHistory(location: Location) {
    const {action, url, pathname, key} = location;
    const uri = this._urlToUri(url, key);
    let historyList: string[] = [...this._history];
    let stackList: string[] = [...this._stack];
    if (action === 'RELAUNCH') {
      historyList = [uri];
      stackList = [pathname];
    } else if (action === 'PUSH') {
      historyList.unshift(uri);
      if (historyList.length > 10) {
        historyList.length = 10;
      }
      if (stackList[0] !== pathname) {
        stackList.unshift(pathname);
      }
      if (stackList.length > 10) {
        stackList.length = 10;
      }
    } else if (action === 'REPLACE') {
      historyList[0] = uri;
      if (stackList[0] !== pathname) {
        const cpathname = this._uriToUrl(historyList[1]).split('?')[0];
        if (cpathname !== stackList[0]) {
          stackList.shift();
        }
        if (stackList[0] !== pathname) {
          stackList.unshift(pathname);
        }
        if (stackList.length > 10) {
          stackList.length = 10;
        }
      }
    } else if (action.startsWith('POP')) {
      const n = parseInt(action.replace('POP', ''), 10) || 1;
      const arr = historyList.splice(0, n + 1, uri).reduce((pre: string[], curUri) => {
        const pn = this._uriToUrl(curUri).split('?')[0];
        if (pre[pre.length - 1] !== pn) {
          pre.push(pn);
        }
        return pre;
      }, []);
      if (arr[arr.length - 1] === this._uriToUrl(historyList[1]).split('?')[0]) {
        arr.pop();
      }
      stackList.splice(0, arr.length, pathname);
      if (stackList[0] === stackList[1]) {
        stackList.shift();
      }
    }
    return {history: historyList, stack: stackList};
  }

  subscribe(listener: LocationListener<P>): () => void {
    this._uid++;
    const uid = this._uid;
    this._listenList[uid] = listener;
    return () => {
      delete this._listenList[uid];
    };
  }

  block(listener: LocationBlocker<P>): () => void {
    this._uid++;
    const uid = this._uid;
    this._blockerList[uid] = listener;
    return () => {
      delete this._blockerList[uid];
    };
  }

  private _urlToUri(url: string, key: string) {
    return `${key}${this._RSP}${url}`;
  }

  private _uriToUrl(uri = '') {
    return uri.substr(uri.indexOf(this._RSP) + 1);
  }

  private _uriToKey(uri = '') {
    return uri.substr(0, uri.indexOf(this._RSP));
  }

  private _findHistoryByKey(key: string): {index: number; url: string} {
    const index = this._history.findIndex((uri) => uri.startsWith(`${key}${this._RSP}`));
    return {index, url: index > -1 ? this._uriToUrl(this._history[index]) : ''};
  }

  protected dispatch(paLocation: PaLocation, action: HistoryAction, key = '', callNative?: string | number): Promise<Location> {
    key = key || this._createKey();
    const data = this._getEfficientLocation(paLocation, this._getCurPathname());
    const location: Location = {...data.location, action, url: locationToUrl(data.location), key};
    const routeData: RouteData = {...data.routeData, action, key};

    return Promise.all(Object.values(this._blockerList).map((fn) => fn(location, this.getLocation(), routeData, this.getRouteData()))).then(() => {
      this._location = location;
      this._routeData = routeData;
      if (!this._startupLocation) {
        this._startupLocation = location;
        this._startupRouteData = routeData;
      }
      const {history, stack} = this._buildHistory(location);
      this._history = history;
      this._stack = stack;
      Object.values(this._listenList).forEach((listener) => listener({location, data: routeData, history: this._history, stack: this._stack}));
      if (callNative) {
        if (typeof callNative === 'number') {
          this.nativeHistory.pop(callNative);
        } else {
          this.nativeHistory[callNative](this.locationMap ? this.locationMap.out(location) : location);
        }
      }
      return location;
    });
  }

  protected passive(nativeLocation: NativeLocation, action: HistoryAction) {
    if (nativeLocation.key !== this._getCurKey()) {
      if (action === 'POP') {
        if (nativeLocation.key) {
          const {index, url} = this._findHistoryByKey(nativeLocation.key);
          if (index > 0) {
            this.dispatch(urlToLocation(url), `POP${index}` as any, nativeLocation.key);
            return;
          }
        }
        action = 'RELAUNCH';
      }
      const location = urlToLocation(nativeLocation.url);
      this.dispatch(this.locationMap ? this.locationMap.in(location) : location, action, nativeLocation.key);
    }
  }

  relaunch(data: RoutePayload<P> | LocationPayload | string): Promise<Location> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'RELAUNCH', '', 'relaunch');
  }

  push(data: RoutePayload<P> | LocationPayload | string): Promise<Location> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'PUSH', '', 'push');
  }

  replace(data: RoutePayload<P> | LocationPayload | string): Promise<Location> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'REPLACE', '', 'replace');
  }

  pop(n = 1, root: 'HOME' | 'FIRST' | '' = 'FIRST'): Promise<Location> {
    n = n || 1;
    const uri = this._history[n];
    if (uri) {
      const url = this._uriToUrl(uri);
      const key = this._uriToKey(uri);
      const paLocation = urlToLocation(url);
      return this.dispatch(paLocation, `POP${n}` as any, key, n);
    }
    let url: string = root;
    if (root === 'HOME') {
      url = this._homeUrl;
    } else if (root === 'FIRST') {
      url = this._startupLocation!.url;
    }
    if (!url) {
      return Promise.reject(1);
    }
    return this.relaunch(url);
  }

  home(root: 'HOME' | 'FIRST' = 'FIRST'): Promise<Location> {
    return this.relaunch(root === 'HOME' ? this._homeUrl : this._startupLocation!.url);
  }
  // locationToRouteData(location: Location): RouteData<P> {
  //   const data = this._transformRoute.locationToRoute(location);
  //   return {...data, key: location.key, action: location.action} as RouteData<P>;
  // }

  // routeToLocation(paths: string[] | string, params: P | undefined, action: HistoryAction, key: string): Location {
  //   const location = this._transformRoute.routeToLocation(paths, params);
  //   return {...location, key, action, url: safelocationToUrl(location)};
  // }

  // payloadToLocation(payload: LocationPayload | RoutePayload<P>, action: HistoryAction, key: string): Location {
  //   const data = this._transformRoute.payloadToLocation(payload);
  //   return {...data, key, action, url: safelocationToUrl(data)};
  // }

  abstract destroy(): void;
}
