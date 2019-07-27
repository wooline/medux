import {ActionTypes, VSP, defaultRouteParams, getActionData} from '@medux/core';
import {DisplayViews, RouteData, RouteState} from '@medux/core/types/export';
import {HistoryActions, LocationToRoute, RouteToLocation, TransformRoute} from '@medux/web';
import {compilePath, compileToPath, matchPath} from './matchPath';

import {Middleware} from 'redux';
import assignDeep from 'deep-extend';

// 排除默认路由参数，路由中如果参数值与默认参数相同可省去
function excludeDefaultData(data: any, def: any) {
  const result: any = {};
  Object.keys(data).forEach(key => {
    let value = data[key];
    const defaultValue = def[key];
    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && typeof value === 'object' && !Array.isArray(value)) {
        value = excludeDefaultData(value, defaultValue);
      }
      if (value !== undefined) {
        result[key] = value;
      }
    }
  });

  if (Object.keys(result).length === 0) {
    return undefined;
  }
  return result;
}

// 合并默认路由参数，如果路由中某参数没传，将用默认值替代，与上面方法互逆
function mergeDefaultData(views: {[moduleName: string]: any}, data: any, def: any) {
  const newData = {...data};
  Object.keys(views).forEach(moduleName => {
    if (!newData[moduleName] && def[moduleName]) {
      newData[moduleName] = {};
    }
  });
  Object.keys(newData).forEach(moduleName => {
    if (def[moduleName]) {
      newData[moduleName] = assignDeep({}, def[moduleName], newData[moduleName]);
    }
  });
  return newData;
}

export const mergeDefaultParamsMiddleware: Middleware = () => (next: Function) => (action: any) => {
  if (action.type === ActionTypes.F_ROUTE_CHANGE) {
    const payload = getActionData<RouteState>(action);
    const params = mergeDefaultData(payload.data.views, payload.data.params, defaultRouteParams);
    action = {...action, payload: {...payload, data: {...payload.data, params}}};
  }
  return next(action);
};
export interface RouteConfig {
  [path: string]: string | [string, RouteConfig];
}

function getSearch(searchOrHash: string, key: string): string {
  if (searchOrHash.length < 4) {
    return '';
  }
  const reg = new RegExp(`[&?#]${key}=`);
  const str = searchOrHash.split(reg)[1];
  if (!str) {
    return '';
  }
  return str.split('&')[0];
}

const ISO_DATE_FORMAT = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-][01]\d:[0-5]\d)$/;

/*
  将字符串变成 Data，因为 JSON 中没有 Date 类型，所以用正则表达式匹配自动转换
*/
function searchParse(search: string, key: string = 'q'): undefined | {[moduleName: string]: {[key: string]: any}} {
  search = getSearch(search, key);
  if (!search) {
    return undefined;
  }
  return JSON.parse(unescape(search), (prop: any, value: any) => {
    if (typeof value === 'string' && ISO_DATE_FORMAT.test(value)) {
      return new Date(value);
    }
    return value;
  });
}

function searchStringify(searchData: any, key: string = 'q'): string {
  if (!searchData) {
    return '';
  }
  const str = JSON.stringify(searchData);
  if (!str || str === '{}') {
    return '';
  }
  return `${key}=${escape(str)}`;
}
function pathnameParse(pathname: string, routeConfig: RouteConfig, paths: string[], args: {[moduleName: string]: {[key: string]: any}}) {
  for (const rule in routeConfig) {
    if (routeConfig.hasOwnProperty(rule)) {
      const item = routeConfig[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;
      const match = matchPath(pathname, {path: rule, exact: !pathConfig});
      // const match = matchPath(pathname, {path: rule.replace(/\$$/, ''), exact: rule.endsWith('$')});
      if (match) {
        paths.push(viewName);
        const moduleName = viewName.split(VSP)[0];
        const {params} = match;
        if (params && Object.keys(params).length > 0) {
          args[moduleName] = {...args[moduleName], ...params};
        }
        if (pathConfig) {
          pathnameParse(pathname, pathConfig, paths, args);
        }
        return;
      }
    }
  }
}

function compileConfig(routeConfig: RouteConfig, parentAbsoluteViewName: string = '', viewToRule: {[viewName: string]: string} = {}, ruleToKeys: {[rule: string]: (string | number)[]} = {}) {
  // ruleToKeys将每条rule中的params key解析出来
  for (const rule in routeConfig) {
    if (routeConfig.hasOwnProperty(rule)) {
      if (!ruleToKeys[rule]) {
        const {keys} = compilePath(rule, {end: true, strict: false, sensitive: false});
        ruleToKeys[rule] = keys.reduce((prev: (string | number)[], cur) => {
          prev.push(cur.name);
          return prev;
        }, []);
      }
      const item = routeConfig[rule];
      const [viewName, pathConfig] = typeof item === 'string' ? [item, null] : item;
      const absoluteViewName = parentAbsoluteViewName + '/' + viewName;
      viewToRule[absoluteViewName] = rule;
      if (pathConfig) {
        compileConfig(pathConfig, absoluteViewName, viewToRule, ruleToKeys);
      }
    }
  }
  return {viewToRule, ruleToKeys};
}

type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

type Params = RouteData['params'];
export interface RoutePayload<P extends Params = Params> {
  extend?: RouteData;
  params?: DeepPartial<P>;
  paths?: string[];
}
export function fillRouteData(routePayload: RoutePayload): RouteData {
  const extend: RouteData = routePayload.extend || {views: {}, paths: [], params: defaultRouteParams};
  const paths = routePayload.paths || extend.paths;
  const views: DisplayViews = paths.reduce((prev: DisplayViews, cur) => {
    const [moduleName, viewName] = cur.split(VSP);
    if (viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }
      prev[moduleName]![viewName] = true;
    }
    return prev;
  }, {});
  const params = mergeDefaultData(views, routePayload.params, extend.params);
  return {views, paths, params};
}

export function getRouteActions<T extends Params>(getHistoryActions: () => HistoryActions<RouteData>): HistoryActions<RoutePayload<T>> {
  return {
    push(data) {
      let args = data as any;
      if (typeof data !== 'string' && !data['pathname']) {
        args = fillRouteData(data as RoutePayload);
      }
      getHistoryActions().push(args);
    },
    replace(data) {
      let args = data as any;
      if (typeof data !== 'string' && !data['pathname']) {
        args = fillRouteData(data as RoutePayload);
      }
      getHistoryActions().replace(args);
    },
    go(n) {
      getHistoryActions().go(n);
    },
    goBack() {
      getHistoryActions().goBack();
    },
    goForward() {
      getHistoryActions().goForward();
    },
  };
}

export function buildTransformRoute(routeConfig: RouteConfig): TransformRoute {
  const {viewToRule, ruleToKeys} = compileConfig(routeConfig);
  const locationToRoute: LocationToRoute = location => {
    const paths: string[] = [];
    const params: {[moduleName: string]: {[key: string]: any}} = searchParse(location.search) || {};
    pathnameParse(location.pathname, routeConfig, paths, params);
    const views: DisplayViews = paths.reduce((prev: DisplayViews, cur) => {
      const [moduleName, viewName] = cur.split(VSP);
      if (viewName) {
        if (!prev[moduleName]) {
          prev[moduleName] = {};
        }
        prev[moduleName]![viewName] = true;
      }
      return prev;
    }, {});
    const hashParams: {[moduleName: string]: {[key: string]: any}} = searchParse(location.hash) || {};
    for (const moduleName in hashParams) {
      if (hashParams.hasOwnProperty(moduleName)) {
        const moduleParams = hashParams[moduleName];
        Object.keys(moduleParams).forEach(key => {
          if (!params[moduleName]) {
            params[moduleName] = {};
          }
          params[moduleName][key] = moduleParams[key];
        });
      }
    }
    return {paths, params, views};
  };
  const routeToLocation: RouteToLocation = routeData => {
    const {paths, params} = routeData;
    let pathname = '';
    let args: {[moduleName: string]: {[key: string]: any} | undefined};
    if (paths.length > 0) {
      args = {};
      // 将args二层克隆params，因为后面可能会删除path中使用到的变量
      for (const moduleName in params) {
        if (params[moduleName] && params.hasOwnProperty(moduleName)) {
          args[moduleName] = {...params[moduleName]};
        }
      }
      paths.reduce((parentAbsoluteViewName, viewName, index) => {
        const absoluteViewName = parentAbsoluteViewName + '/' + viewName;
        const rule = viewToRule[absoluteViewName];
        const moduleName = viewName.split(VSP)[0];
        //最深的一个view可以决定pathname
        if (index === paths.length - 1) {
          // const toPath = compileToPath(rule.replace(/\$$/, ''));
          const toPath = compileToPath(rule);
          pathname = toPath(params[moduleName]);
        }
        //pathname中传递的值可以不在params中重复传递
        const keys = ruleToKeys[rule] || [];
        keys.forEach(key => {
          if (args[moduleName]) {
            delete args[moduleName]![key];
          }
        });
        return absoluteViewName;
      }, '');
    } else {
      args = params;
    }
    //将带_前缀的变量放到hashData中
    const searchData = {};
    const hashData = {};
    for (const moduleName in args) {
      if (args[moduleName] && args.hasOwnProperty(moduleName)) {
        const data = args[moduleName]!;
        const keys = Object.keys(data);
        if (keys.length > 0) {
          keys.forEach(key => {
            if (key.startsWith('_')) {
              if (!hashData[moduleName]) {
                hashData[moduleName] = {};
              }
              hashData[moduleName][key] = data[key];
            } else {
              if (!searchData[moduleName]) {
                searchData[moduleName] = {};
              }
              searchData[moduleName][key] = data[key];
            }
          });
        }
      }
    }
    return {
      pathname,
      search: searchStringify(excludeDefaultData(searchData, defaultRouteParams)),
      hash: searchStringify(excludeDefaultData(hashData, defaultRouteParams)),
    };
  };
  return {
    locationToRoute,
    routeToLocation,
  };
}
