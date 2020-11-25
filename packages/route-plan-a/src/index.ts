/* eslint-disable @typescript-eslint/no-use-before-define */
import {CoreModuleHandlers, CoreModuleState, config, reducer} from '@medux/core';
import {Middleware, Reducer} from 'redux';
import {compileToPath, matchPath} from './matchPath';
import {RouteActionTypes, routeConfig, checkLocation, compileRule, HistoryAction, DisplayViews, urlToLocation, routeChangeAction, beforeRouteChangeAction, routeParamsAction} from './basic';
import assignDeep from './deep-extend';
import type {RouteParams, Location, PaRouteData, PaLocation, RouteState, RoutePayload, RouteRule} from './basic';

export const deepAssign = assignDeep;

export type {RootState, PaRouteData, PaLocation, RouteState, RoutePayload, Location, RouteRule, RouteParams} from './basic';
export {setRouteConfig} from './basic';

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
  if (routeConfig.escape) {
    search = unescape(search);
  }
  try {
    return JSON.parse(search, routeConfig.dateParse ? dateParse : undefined);
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
  if (routeConfig.escape) {
    return escape(str);
  }
  return str;
}

function splitSearch(search: string) {
  const reg = new RegExp(`[?&#]${routeConfig.splitKey}=([^&]+)`);
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
function pathnameParse(pathname: string, routeRule: RouteRule, paths: string[], args: {[moduleName: string]: {[key: string]: any} | undefined}) {
  for (const rule in routeRule) {
    if (routeRule.hasOwnProperty(rule)) {
      const item = routeRule[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;
      const match = matchPath(pathname, {path: rule.replace(/\$$/, ''), exact: !pathConfig});
      // const match = matchPath(pathname, {path: rule.replace(/\$$/, ''), exact: rule.endsWith('$')});
      if (match) {
        paths.push(viewName);
        const moduleName = viewName.split(config.VSP)[0];
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

/**
 * 为params加上默认值
 * 如果paths中包含某module，也加上默认值
 */
export function assignRouteData(paths: string[], params: {[moduleName: string]: any}, defaultRouteParams: {[moduleName: string]: any}): PaRouteData {
  const views: DisplayViews = paths.reduce((prev: DisplayViews, cur) => {
    const [moduleName, viewName] = cur.split(config.VSP);
    if (moduleName && viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }
      prev[moduleName]![viewName] = true;
      if (!params[moduleName]) {
        params[moduleName] = undefined;
      }
    }
    return prev;
  }, {});
  Object.keys(params).forEach((moduleName) => {
    if (defaultRouteParams[moduleName]) {
      params[moduleName] = assignDeep({}, defaultRouteParams[moduleName], params[moduleName]);
    }
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
    const [moduleName, view] = viewName.split(config.VSP);
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

// export type LocationListener<P extends RouteParams> = (routeState: RouteState<Location, P>) => void;
// export type LocationBlocker<P extends RouteParams> = (location: Location, curLocation: Location | undefined, routeData: RouteData<P>, curRouteData: RouteData<P> | undefined) => void | Promise<void>;

export type LocationToLocation = (location: PaLocation) => PaLocation;
export type LocationMap = {in: LocationToLocation; out: LocationToLocation};
export interface NativeHistory {
  push(location: Location): void;
  replace(location: Location): void;
  relaunch(location: Location): void;
  pop(location: Location, n: number): void;
}

export interface Store {
  dispatch(action: {type: string}): any;
}

export abstract class BaseHistoryActions<P extends RouteParams = RouteParams> {
  private _tid = 0;

  // private _uid = 0;

  // private _listenList: {[key: string]: LocationListener<P>} = {};

  // private _blockerList: {[key: string]: LocationBlocker<P>} = {};

  // private _location: Location | undefined;

  private _routeState: RouteState<P>;

  private _startupRouteState: RouteState<P>;

  protected store: Store | undefined;

  private _viewToRule: {
    [viewName: string]: string;
  };

  private _ruleToKeys: {
    [rule: string]: (string | number)[];
  };

  private _viewToPaths: {
    [viewName: string]: string[];
  };

  constructor(
    protected nativeHistory: NativeHistory,
    protected defaultRouteParams: {[moduleName: string]: any},
    protected initUrl: string,
    protected routeRule: RouteRule,
    protected locationMap?: LocationMap
  ) {
    const {viewToRule, ruleToKeys, viewToPaths} = compileRule(routeRule);
    this._viewToRule = viewToRule;
    this._ruleToKeys = ruleToKeys;
    this._viewToPaths = viewToPaths;
    const safeLocation = urlToLocation(initUrl);
    const routeState = this._createRouteState(safeLocation, 'RELAUNCH', '');
    this._routeState = routeState;
    this._startupRouteState = routeState;
    nativeHistory.relaunch(routeState);
  }

  setStore(_store: Store) {
    this.store = _store;
  }

  mergeInitState<T extends RouteRootState>(initState: T): RouteRootState {
    const routeState = this.getRouteState();
    const data: RouteRootState = {...initState, route: routeState};
    Object.keys(routeState.views).forEach((moduleName) => {
      if (!data[moduleName]) {
        data[moduleName] = {};
      }
      data[moduleName] = {...data[moduleName], routeParams: routeState.params[moduleName]};
    });
    return data;
  }

  getModulePath(): string[] {
    return this.getRouteState().paths.map((viewName) => viewName.split(config.VSP)[0]);
  }

  protected getCurKey(): string {
    return this._routeState.key;
  }

  getRouteState(): RouteState<P> {
    return this._routeState;
  }
  // getLocation(startup?: boolean): Location | undefined {
  //   return startup ? this._startupLocation : this._location;
  // }

  // getRouteData(startup?: boolean): RouteData<P> | undefined {
  //   return startup ? this._startupRouteData : this._routeData;
  // }
  locationToUrl(safeLocation: PaLocation) {
    return safeLocation.pathname + safeLocation.search + safeLocation.hash;
  }

  protected locationToRoute(safeLocation: PaLocation): PaRouteData<P> {
    // const safeLocation = checkLocation(location, this._getCurPathname());
    const url = this.locationToUrl(safeLocation);
    const item = cacheData.find((val) => {
      return val && val.url === url;
    });
    if (item) {
      return item.routeData as PaRouteData<P>;
    }
    const pathname = safeLocation.pathname;
    const paths: string[] = [];
    const pathsArgs: {[moduleName: string]: {[key: string]: any}} = {};
    pathnameParse(pathname, this.routeRule, paths, pathsArgs);
    const params = splitSearch(safeLocation.search);
    const hashParams = splitSearch(safeLocation.hash);
    assignDeep(params, hashParams);
    const routeData = assignRouteData(paths, assignDeep(pathsArgs, params), this.defaultRouteParams);
    cacheData.unshift({url, routeData});
    cacheData.length = 100;
    return routeData as PaRouteData<P>;
  }

  protected routeToLocation(paths: string[], params?: RouteParams): PaLocation {
    params = params || ({} as any);
    let views: DisplayViews = {};
    const data = pathsToPathname(paths, params, this._viewToRule, this._ruleToKeys);
    const pathname = data.pathname;
    params = data.params;
    views = data.views;
    const paramsFilter = excludeDefaultData(params as any, this.defaultRouteParams, false, views);
    const {search, hash} = extractHashData(paramsFilter);
    return {
      pathname,
      search: search ? `?${routeConfig.splitKey}=${search}` : '',
      hash: hash ? `#${routeConfig.splitKey}=${hash}` : '',
    };
  }

  payloadToRoute(data: RoutePayload<P> | string): PaRouteData<P> {
    if (typeof data === 'string') {
      return this.locationToRoute(urlToLocation(data));
    }
    if (data.pathname && !data.extendParams && !data.params) {
      return this.locationToRoute(checkLocation(data));
    }
    const clone: RoutePayload & {paths?: string[]} = {...data};
    if (clone.extendParams === true) {
      clone.extendParams = this.getRouteState().params;
    }
    if (clone.pathname) {
      clone.paths = [];
      clone.params = {};
      pathnameParse(clone.pathname, this.routeRule, clone.paths, clone.params);
      assignDeep(clone.params, data.params);
    }
    if (!clone.paths) {
      clone.paths = clone.viewName ? this._viewToPaths[clone.viewName] : this.getRouteState().paths;
    }
    if (!clone.paths) {
      throw 'Route Paths Not Found!';
    }
    const params: RouteParams | undefined = clone.extendParams ? assignDeep({}, clone.extendParams, clone.params) : clone.params;
    return assignRouteData(clone.paths, params || {}, this.defaultRouteParams) as PaRouteData<P>;
  }

  viewNameToPaths(viewName: string): string[] | undefined {
    return this._viewToPaths[viewName];
  }

  payloadToLocation(data: RoutePayload<P> | string): PaLocation {
    if (typeof data === 'string') {
      return urlToLocation(data);
    }
    if (data.pathname && !data.extendParams && !data.params) {
      return checkLocation(data);
    }
    const clone: RoutePayload & {paths?: string[]} = {...data};
    if (clone.extendParams === true) {
      clone.extendParams = this.getRouteState().params;
    }
    if (clone.pathname) {
      clone.paths = [];
      clone.params = {};
      pathnameParse(clone.pathname, this.routeRule, clone.paths, clone.params);
      assignDeep(clone.params, data.params);
    }
    if (!clone.paths) {
      clone.paths = clone.viewName ? this._viewToPaths[clone.viewName] : this.getRouteState().paths;
    }
    if (!clone.paths) {
      throw 'Route Paths Not Found!';
    }
    const params: RouteParams | undefined = clone.extendParams ? assignDeep({}, clone.extendParams, clone.params) : clone.params;
    return this.routeToLocation(clone.paths, params);
  }

  private _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  private _getEfficientLocation(safeLocation: PaLocation): {location: PaLocation; routeData: PaRouteData<P>} {
    const routeData = this.locationToRoute(safeLocation);
    if (routeData.views['@']) {
      const url = Object.keys(routeData.views['@'])[0];
      const reLocation = urlToLocation(url);
      return this._getEfficientLocation(reLocation);
    }
    return {location: safeLocation, routeData};
  }

  private _buildHistory(location: Location) {
    const maxLength = routeConfig.historyMax;
    const {action, url, pathname, key} = location;
    const {history, stack} = this._routeState || {history: [], stack: []};
    const uri = this._urlToUri(url, key);
    let historyList: string[] = [...history];
    let stackList: string[] = [...stack];
    if (action === 'RELAUNCH') {
      historyList = [uri];
      stackList = [pathname];
    } else if (action === 'PUSH') {
      historyList.unshift(uri);
      if (historyList.length > maxLength) {
        historyList.length = maxLength;
      }
      if (stackList[0] !== pathname) {
        stackList.unshift(pathname);
      }
      if (stackList.length > maxLength) {
        stackList.length = maxLength;
      }
    } else if (action === 'REPLACE') {
      historyList[0] = uri;
      if (stackList[0] !== pathname) {
        const cpathname = this._uriToPathname(historyList[1]);
        if (cpathname !== stackList[0]) {
          stackList.shift();
        }
        if (stackList[0] !== pathname) {
          stackList.unshift(pathname);
        }
        if (stackList.length > maxLength) {
          stackList.length = maxLength;
        }
      }
    } else if (action.startsWith('POP')) {
      const n = parseInt(action.replace('POP', ''), 10) || 1;
      const arr = historyList.splice(0, n + 1, uri).reduce((pre: string[], curUri) => {
        const cpathname = this._uriToPathname(curUri);
        if (pre[pre.length - 1] !== cpathname) {
          pre.push(cpathname);
        }
        return pre;
      }, []);
      if (arr[arr.length - 1] === this._uriToPathname(historyList[1])) {
        arr.pop();
      }
      stackList.splice(0, arr.length, pathname);
      if (stackList[0] === stackList[1]) {
        stackList.shift();
      }
    }
    return {history: historyList, stack: stackList};
  }

  // subscribe(listener: LocationListener<P>): () => void {
  //   this._uid++;
  //   const uid = this._uid;
  //   this._listenList[uid] = listener;
  //   return () => {
  //     delete this._listenList[uid];
  //   };
  // }

  // block(listener: LocationBlocker<P>): () => void {
  //   this._uid++;
  //   const uid = this._uid;
  //   this._blockerList[uid] = listener;
  //   return () => {
  //     delete this._blockerList[uid];
  //   };
  // }

  private _urlToUri(url: string, key: string) {
    return `${key}${routeConfig.RSP}${url}`;
  }

  private _uriToUrl(uri = '') {
    return uri.substr(uri.indexOf(routeConfig.RSP) + 1);
  }

  private _uriToPathname(uri = '') {
    const url = this._uriToUrl(uri);
    return url.split(/[?#]/)[0];
  }

  private _uriToKey(uri = '') {
    return uri.substr(0, uri.indexOf(routeConfig.RSP));
  }

  protected findHistoryByKey(key: string): {index: number; url: string} {
    const {history} = this._routeState;
    const index = history.findIndex((uri) => uri.startsWith(`${key}${routeConfig.RSP}`));
    return {index, url: index > -1 ? this._uriToUrl(history[index]) : ''};
  }

  private _toNativeLocation(location: Location): Location {
    if (this.locationMap) {
      const nLocation = checkLocation(this.locationMap.out(location));
      return {...nLocation, action: location.action, url: this.locationToUrl(nLocation), key: location.key};
    }
    return location;
  }

  private _createRouteState(safeLocation: PaLocation, action: HistoryAction, key: string): RouteState<P> {
    key = key || this._createKey();
    const data = this._getEfficientLocation(safeLocation);
    const location: Location = {...data.location, action, url: this.locationToUrl(data.location), key};
    const {history, stack} = this._buildHistory(location);
    const routeState: RouteState<P> = {...location, ...data.routeData, history, stack};
    return routeState;
  }

  protected async dispatch(safeLocation: PaLocation, action: HistoryAction, key: string = '', callNative?: string | number): Promise<RouteState<P>> {
    const routeState = this._createRouteState(safeLocation, action, key);
    await this.store!.dispatch(beforeRouteChangeAction(routeState));
    this._routeState = routeState;
    await this.store!.dispatch(routeChangeAction(routeState));
    if (callNative) {
      const nativeLocation = this._toNativeLocation(routeState);
      if (typeof callNative === 'number') {
        this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative);
      } else {
        this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation);
      }
    }
    return routeState;
    // return Promise.all(Object.values(this._blockerList).map((fn) => fn(location, this.getLocation(), routeData, this.getRouteData()))).then(() => {
    //   this._location = location;
    //   this._routeData = routeData;
    //   if (!this._startupLocation) {
    //     this._startupLocation = location;
    //     this._startupRouteData = routeData;
    //   }
    //   this._history = history;
    //   this._stack = stack;
    //   Object.values(this._listenList).forEach((listener) => listener({location, data: routeData, history: this._history, stack: this._stack}));
    //   if (callNative) {
    //     const nativeLocation = this._toNativeLocation(location);
    //     if (typeof callNative === 'number') {
    //       this.nativeHistory.pop && this.nativeHistory.pop(nativeLocation, callNative);
    //     } else {
    //       this.nativeHistory[callNative] && this.nativeHistory[callNative](nativeLocation);
    //     }
    //   }
    //   return location;
    // });
  }

  // protected passive(nativeLocation: NativeLocation, action: HistoryAction) {
  //   if (nativeLocation.key !== this.getCurKey()) {
  //     if (action === 'POP') {
  //       if (nativeLocation.key) {
  //         const {index, url} = this._findHistoryByKey(nativeLocation.key);
  //         if (index > 0) {
  //           this.dispatch(urlToLocation(url), `POP${index}` as any, nativeLocation.key);
  //           return;
  //         }
  //       }
  //       action = 'RELAUNCH';
  //     }
  //     const location = urlToLocation(nativeLocation.url);
  //     this.dispatch(this.locationMap ? this.locationMap.in(location) : location, action, nativeLocation.key);
  //   }
  // }

  relaunch(data: RoutePayload<P> | string, disableNative?: boolean): Promise<Location> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'RELAUNCH', '', disableNative ? '' : 'relaunch');
  }

  push(data: RoutePayload<P> | string, disableNative?: boolean): Promise<Location> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'PUSH', '', disableNative ? '' : 'push');
  }

  replace(data: RoutePayload<P> | string, disableNative?: boolean): Promise<Location> {
    const paLocation = this.payloadToLocation(data);
    return this.dispatch(paLocation, 'REPLACE', '', disableNative ? '' : 'replace');
  }

  pop(n = 1, root: 'HOME' | 'FIRST' | '' = 'FIRST', disableNative?: boolean): Promise<Location> {
    n = n || 1;
    const uri = this._routeState.history[n];
    if (uri) {
      const url = this._uriToUrl(uri);
      const key = this._uriToKey(uri);
      const paLocation = urlToLocation(url);
      return this.dispatch(paLocation, `POP${n}` as any, key, disableNative ? '' : n);
    }
    let url: string = root;
    if (root === 'HOME') {
      url = routeConfig.homeUrl;
    } else if (root === 'FIRST') {
      url = this._startupRouteState.url;
    }
    if (!url) {
      return Promise.reject(1);
    }
    return this.relaunch(url, disableNative);
  }

  home(root: 'HOME' | 'FIRST' = 'FIRST', disableNative?: boolean): Promise<Location> {
    return this.relaunch(root === 'HOME' ? routeConfig.homeUrl : this._startupRouteState.url, disableNative);
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
export const routeMiddleware: Middleware = ({dispatch, getState}) => (next) => (action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    const routeState: RouteState = action.payload[0];
    const rootRouteParams = routeState.params;
    const rootState = getState();
    Object.keys(rootRouteParams).forEach((moduleName) => {
      const routeParams = rootRouteParams[moduleName];
      if (routeParams) {
        if (rootState[moduleName]?.initialized) {
          dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
        }
      }
    });
  }
  return next(action);
};
export const routeReducer: Reducer = (state: RouteState, action) => {
  if (action.type === RouteActionTypes.RouteChange) {
    return action.payload[0];
  }
  return state;
};

// if (action.type === ActionTypes.RouteChange) {
//   const routeData = meta.prevState.route.data;
//   const rootRouteParams = routeData.params;
//   Object.keys(rootRouteParams).forEach((moduleName) => {
//     const routeParams = rootRouteParams[moduleName];
//     if (routeParams && Object.keys(routeParams).length > 0 && meta.injectedModules[moduleName]) {
//       dispatch(routeParamsAction(moduleName, routeParams, routeData.action));
//     }
//   });
// }

// eslint-disable-next-line @typescript-eslint/ban-types
export interface RouteModuleState<R extends Record<string, any> = {}> extends CoreModuleState {
  routeParams?: R;
}
type RouteRootState = {
  [moduleName: string]: RouteModuleState;
} & {
  route: RouteState;
};
export class RouteModuleHandlers<S extends RouteModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
  @reducer
  public Init(initState: S): S {
    const routeParams = this.rootState.route.params[this.moduleName];
    return routeParams ? {...initState, routeParams} : initState;
  }

  @reducer
  public RouteParams(payload: S['routeParams']): S {
    return {
      ...this.state,
      routeParams: payload,
    };
  }
}
