import {HistoryProxy, RouteData} from '@medux/core';
import {MeduxLocation, RouteConfig, TransformRoute, assignRouteData, buildTransformRoute, checkUrl, deepAssign, locationToUrl, urlToLocation} from '@medux/route-plan-a';

type UnregisterCallback = () => void;
interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
}

type MeduxLocationListener = (location: MeduxLocation) => void;

export type LocationToLocation = (location: MeduxLocation) => MeduxLocation;
export type LocationMap = {in: LocationToLocation; out: LocationToLocation};

export interface History {
  location: BrowserLocation;
  action: string;
  push(path: string): void;
  replace(path: string): void;
  go(n: number): void;
  back(): void;
  forward(): void;
  listen(listener: (location: BrowserLocation, action: string) => void): UnregisterCallback;
}

/**
 * 定义一种数据结构，根据此结构可以生成一个url
 */
export interface BrowserRoutePayload<P = {}> {
  /**
   * 可以继承一个RouteData
   */
  extend?: RouteData;
  /**
   * 将和继承的RouteData合并merge
   */
  params?: DeepPartial<P>;
  /**
   * 要展示的Views
   */
  paths?: string[];
  /**
   * 当前路由的打开方式 POP/PUSH/REPLACE
   */
  action?: string;
}

/**
 * 经过封装后的HistoryAPI比浏览器自带的history更强大
 */
export interface HistoryActions<P = {}> {
  /**
   * 接受监听回调
   */
  listen(listener: MeduxLocationListener): UnregisterCallback;
  /**
   * 获取当前路由的原始路由数据
   */
  getLocation(): MeduxLocation;
  /**
   * 获取当前路由的经过转换之后的路由数据
   */
  getRouteData(): RouteData;
  /**
   * 同浏览器的history.push方法
   * @param data 除了可以接受一个url字符串外，也可以接受medux的RouteData
   */
  push(data: BrowserRoutePayload<P> | Partial<MeduxLocation> | string): void;
  /**
   * 同浏览器的history.replace
   * @param data 除了可以接受一个url字符串外，也可以接受medux的RouteData
   */
  replace(data: BrowserRoutePayload<P> | Partial<MeduxLocation> | string): void;
  /**
   * 同浏览器的history.go
   */
  go(n: number): void;
  /**
   * 同浏览器的history.goBack
   */
  back(): void;
  /**
   * 同浏览器的history.goForward
   */
  forward(): void;
}

type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

/**
 * 将浏览器的路由数据结构转换为medux标准的RouteData
 */
export function fillBrowserRouteData(routePayload: BrowserRoutePayload): RouteData {
  const extend: RouteData = routePayload.extend || {views: {}, paths: [], stackParams: [], params: {}};
  const stackParams = [...extend.stackParams];
  if (routePayload.params) {
    stackParams[0] = deepAssign({}, stackParams[0], routePayload.params);
  }
  return assignRouteData(routePayload.paths || extend.paths, stackParams, undefined, extend.action);
}

function isBrowserRoutePayload(data: Partial<MeduxLocation> | BrowserRoutePayload): data is BrowserRoutePayload {
  return !data['pathname'];
}
function fillLocation(location: Partial<MeduxLocation>): MeduxLocation {
  return {
    pathname: location.pathname || '',
    search: location.search || '',
    hash: location.hash || '',
    action: location.action,
  };
}
/**
 * 创建一个路由解析器
 * @param history 浏览器的history或其代理
 * @param routeConfig 应用的路由配置文件
 * @returns {transformRoute,historyProxy,historyActions,toBrowserUrl}
 */
export function createRouter(history: History, routeConfig: RouteConfig, locationMap?: LocationMap) {
  const transformRoute: TransformRoute = buildTransformRoute(routeConfig);

  const historyProxy: HistoryProxy<MeduxLocation> = {
    initialized: true,
    getLocation() {
      return {...history.location, action: history.action};
    },
    subscribe(listener) {
      const unlink = history.listen((location, action) => {
        listener({...location, action});
      });
      return unlink;
    },
    locationToRouteData(location) {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(location) : location);
    },
    equal(a, b) {
      return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
    },
    patch(location): void {
      const url = locationToUrl(location);
      history.push(url);
    },
  };

  function navigateTo<P>(action: 'push' | 'replace', data: BrowserRoutePayload<P> | Partial<MeduxLocation> | string): void {
    if (typeof data === 'string') {
      let url = checkUrl(data, history.location.pathname);
      if (url) {
        if (locationMap) {
          let location = urlToLocation(url);
          location = locationMap.out(location);
          url = checkUrl(locationToUrl(location));
        }
      }
      history[action](url);
    } else if (isBrowserRoutePayload(data)) {
      const routeData = fillBrowserRouteData(data);
      let location = transformRoute!.routeToLocation(routeData);
      if (locationMap) {
        location = locationMap.out(location);
      }
      const url = checkUrl(locationToUrl(location));
      history[action](url);
    } else {
      const url = checkUrl(locationToUrl(fillLocation(data)));
      history[action](url);
    }
  }

  const historyActions: HistoryActions = {
    listen(listener) {
      const unlink = history.listen((location, action) => {
        listener({...location, action});
      });
      return unlink;
    },
    getLocation() {
      return {...history.location, action: history.action};
    },
    getRouteData() {
      const location = this.getLocation();
      return transformRoute.locationToRoute(locationMap ? locationMap.in(location) : location);
    },
    push(data) {
      navigateTo('push', data);
    },
    replace(data) {
      navigateTo('replace', data);
    },
    go(n: number) {
      history.go(n);
    },
    back() {
      history.back();
    },
    forward() {
      history.forward();
    },
  };

  function toBrowserUrl<P = {}>(data: BrowserRoutePayload<P> | Partial<MeduxLocation>) {
    let location: MeduxLocation;
    if (isBrowserRoutePayload(data)) {
      location = transformRoute.routeToLocation(fillBrowserRouteData(data));
    } else {
      location = fillLocation(data);
    }
    if (locationMap) {
      location = locationMap.out(location);
    }
    return checkUrl(locationToUrl(location));
  }

  return {
    transformRoute,
    historyProxy,
    historyActions,
    toBrowserUrl,
  };
}

/**
 * 将一个内部RouteData序列化为一个url
 */
export type ToBrowserUrl<T = {}> = (routeOptions: BrowserRoutePayload<T> | Partial<MeduxLocation>) => string;
