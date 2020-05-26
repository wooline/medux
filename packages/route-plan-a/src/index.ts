import {DisplayViews, RouteData, config as coreConfig} from '@medux/core';
import {compilePath, compileToPath, matchPath} from './matchPath';

import assignDeep from './deep-extend';

/**
 * medux内部使用的Location数据结构，比浏览器的Location相比少了state属性，所以在此路由方案中不能使用history state
 */
export interface MeduxLocation {
  pathname: string;
  search: string;
  hash: string;
}

/**
 * 将medux内部使用的RouteData转换为浏览器的Location
 */
export type RouteToLocation = (routeData: RouteData) => MeduxLocation;
/**
 * 将浏览器的Location转换为medux内部使用的RouteData
 */
export type LocationToRoute = (location: MeduxLocation) => RouteData;

/**
 * 定义一个浏览器的Location与medux内部使用的RouteData相互转换器
 */
export interface TransformRoute {
  locationToRoute: LocationToRoute;
  routeToLocation: RouteToLocation;
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
// function getSearch(searchOrHash: string, key: string): string {
//   if (searchOrHash.length < 4) {
//     return '';
//   }
//   const reg = new RegExp(`[&?#]${key}=`);
//   const str = searchOrHash.split(reg)[1];
//   if (!str) {
//     return '';
//   }
//   return str.split('&')[0];
// }

/*
  将字符串变成 Data，因为 JSON 中没有 Date 类型，所以用正则表达式匹配自动转换
*/
function searchParse(search: string): {[moduleName: string]: {[key: string]: any} | undefined} {
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
function joinSearchString(arr: string[]): string {
  const strs = [''];
  for (let i = 0, k = arr.length; i < k; i++) {
    strs.push(arr[i] || '');
  }
  return strs.join(`&${config.splitKey}=`);
}
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
  } else {
    return str;
  }
}

function splitSearch(search: string) {
  const reg = new RegExp(`[&?#]${config.splitKey}=[^&]*`, 'g');
  const arr = search.match(reg);
  let stackParams: {[moduleName: string]: {[key: string]: any} | undefined}[] = [];
  if (arr) {
    stackParams = arr.map((str) => {
      return searchParse(str.split('=')[1]);
    });
  }
  return stackParams;
}
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
          args[moduleName] = {...args[moduleName], ...checkPathArgs(params)};
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

// type Params = RouteData['params'];

export interface RoutePayload<P> {
  extend?: RouteData;
  stackParams?: DeepPartial<P>[];
  paths?: string[];
}

export function assignRouteData(paths: string[], stackParams: {[moduleName: string]: any}[], args?: {[moduleName: string]: any}): RouteData {
  if (!stackParams[0]) {
    stackParams[0] = {};
  }
  if (args) {
    stackParams[0] = assignDeep({}, args, stackParams[0]);
  }
  const firstStackParams = stackParams[0];
  const views: DisplayViews = paths.reduce((prev: DisplayViews, cur) => {
    const [moduleName, viewName] = cur.split(coreConfig.VSP);
    if (viewName) {
      if (!prev[moduleName]) {
        prev[moduleName] = {};
      }
      prev[moduleName]![viewName] = true;
      if (!firstStackParams[moduleName]) {
        firstStackParams[moduleName] = {};
      }
    }
    return prev;
  }, {});
  Object.keys(firstStackParams).forEach((moduleName) => {
    firstStackParams[moduleName] = assignDeep({}, config.defaultRouteParams[moduleName], firstStackParams[moduleName]);
  });
  const params = assignDeep({}, ...stackParams);
  Object.keys(params).forEach((moduleName) => {
    if (!firstStackParams[moduleName]) {
      params[moduleName] = assignDeep({}, config.defaultRouteParams[moduleName], params[moduleName]);
    }
  });
  return {views, paths, params, stackParams};
}

export function fillRouteData<R>(routePayload: RoutePayload<R>): RouteData {
  const extend: RouteData = routePayload.extend || {views: {}, paths: [], stackParams: [], params: {}};
  const stackParams = [...extend.stackParams];
  if (routePayload.stackParams) {
    routePayload.stackParams.forEach((item, index) => {
      if (item) {
        stackParams[index] = assignDeep({}, stackParams[index], item);
      }
    });
  }
  return assignRouteData(routePayload.paths || extend.paths, stackParams);
}
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
function locationToUrl(location: MeduxLocation): string {
  return location.pathname + (location.search ? `?${location.search}` : '') + (location.hash ? `#${location.hash}` : '');
}
const cacheData: Array<{url: string; routeData: RouteData}> = [];
/**
 * 创建一个浏览器的Location与medux内部使用的RouteData相互转换器
 * @param 应用的路由配置文件
 * @returns 转换器
 */
export function buildTransformRoute(routeConfig: RouteConfig): TransformRoute {
  const {viewToRule, ruleToKeys} = compileConfig(routeConfig);

  const locationToRoute: LocationToRoute = (location) => {
    const url = locationToUrl(location);
    const item = cacheData.find((val) => {
      return val && val.url === url;
    });
    if (item) {
      return item.routeData;
    }
    const pathname = location.pathname;
    const paths: string[] = [];
    const pathsArgs: {[moduleName: string]: {[key: string]: any}} = {};
    pathnameParse(pathname, routeConfig, paths, pathsArgs);
    const stackParams = splitSearch(location.search);
    const hashStackParams = splitSearch(location.hash);
    hashStackParams.forEach((item, index) => {
      if (item) {
        if (!stackParams[index]) {
          stackParams[index] = {};
        }
        assignDeep(stackParams[index], item);
      }
    });
    const routeData = assignRouteData(paths, stackParams, pathsArgs);
    cacheData.unshift({url, routeData});
    cacheData.length = 10;
    return routeData;
  };
  const routeToLocation: RouteToLocation = (routeData) => {
    const {views, paths, params, stackParams} = routeData;
    const firstStackParams = stackParams[0];
    let pathname = '';
    let firstStackParamsFilter: {[moduleName: string]: {[key: string]: any} | undefined};
    if (paths.length > 0) {
      // 将args深克隆，因为后面可能会删除path中使用到的变量
      firstStackParamsFilter = assignDeep({}, firstStackParams);
      paths.reduce((parentAbsoluteViewName, viewName, index) => {
        const absoluteViewName = parentAbsoluteViewName + '/' + viewName;
        const rule = viewToRule[absoluteViewName];
        const moduleName = viewName.split(coreConfig.VSP)[0];
        //最深的一个view可以决定pathname
        if (index === paths.length - 1) {
          // const toPath = compileToPath(rule.replace(/\$$/, ''));
          const toPath = compileToPath(rule);
          const keys = ruleToKeys[rule] || [];
          const args = keys.reduce((prev, cur) => {
            if (typeof cur === 'string') {
              const props = cur.split('.');
              if (props.length) {
                prev[cur] = props.reduce((p, c) => {
                  return p[c];
                }, params[moduleName]!);
                return prev;
              }
            }
            prev[cur] = params[moduleName]![cur];
            return prev;
          }, {});
          pathname = toPath(args);
        }
        //pathname中传递的值可以不在params中重复传递
        const keys = ruleToKeys[rule] || [];
        keys.forEach((key) => {
          if (typeof key === 'string') {
            const props = key.split('.');
            if (props.length) {
              props.reduce((p, c, i) => {
                if (i === props.length - 1) {
                  delete p[c];
                }
                return p[c] || {};
              }, firstStackParamsFilter[moduleName] || {});
              return;
            }
          }
          if (firstStackParamsFilter[moduleName]) {
            delete firstStackParamsFilter[moduleName]![key];
          }
        });
        return absoluteViewName;
      }, '');
    } else {
      firstStackParamsFilter = firstStackParams;
    }
    //将带_前缀的变量放到hashData中
    const arr = [...stackParams];
    arr[0] = excludeDefaultData(firstStackParamsFilter, config.defaultRouteParams, false, views);
    const searchStrings: string[] = [];
    const hashStrings: string[] = [];
    arr.forEach((params, index) => {
      const {search, hash} = extractHashData(params);
      search && (searchStrings[index] = search);
      hash && (hashStrings[index] = hash);
    });

    return {
      pathname,
      search: '?' + joinSearchString(searchStrings).substr(1),
      hash: '#' + joinSearchString(hashStrings).substr(1),
    };
  };
  return {
    locationToRoute,
    routeToLocation,
  };
}

/**
 '/:articleType/:articleId/comments/:itemId'
 www.aa.com/photos/1/comments/23?p={}&p=

 paths:["app.Main", "photos.detail", "comments.detail"]
 params:{app:{},photos:{itemid:1,searchList:{page:1,pageSize:10},_listkey:222222},comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10},_listkey:222222}}
 stackParams:[{app:{}}, {photos:{itemid:1,searchList:{page:1,pageSize:10},_listkey:222222}}, {comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10},_listkey:222222}}]
 stackParams:[{app:{},photos:{itemid:1,searchList:{page:1,pageSize:10},_listkey:222222},comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10},_listkey:222222}}]

 web: www.aa.com/photos/1/comments/23?p={comments:{searchList:{page:2}}}#p={photos:{_listkey:222222}, comments:{_listkey:222222}}

 rn: www.aa.com/photos/1/comments/23?p={app:{}}&p={photos:{}}&p={comments:{searchList:{page:2}}}#p={}&p={photos:{_listkey:222222}}&p={comments:{_listkey:222222}}

 routeData -> location
1.根据paths得到匹配表达式：'/:articleType/:articleId/comments/:itemId'
2.根据params填充表达式得到：www.aa.com/photos/1/comments/23
3.将params中带_的提取为hash
不作缩减将得到：
www.aa.com/photos/1/comments/23?
p={app:{}}&
p={photos:{itemid:1,searchList:{page:1,pageSize:10}}}&
p={comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2,pageSize:10}}}
#
p={}&
p={photos:{_listkey:222222}}
p={comments:{_listkey:222222}}
4.缩减默认值：
www.aa.com/photos/1/comments/23?
p={app:{}}&
p={photos:{itemid:1}}&
p={comments:{articleType:photos,articleId:1,itemid:23,searchList:{page:2}}}
#
p={}&
p={photos:{_listkey:222222}}
p={comments:{_listkey:222222}}
5.缩减路径传参
www.aa.com/photos/1/comments/23?
p={app:{}}&
p={photos:{}}&
p={comments:{searchList:{page:2}}}
#
p={}&
p={photos:{_listkey:222222}}
p={comments:{_listkey:222222}}
 */
