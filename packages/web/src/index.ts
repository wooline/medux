import {HistoryProxy, RouteData} from '@medux/core';
import {LocationToRoute, MeduxLocation, RouteConfig, RouteToLocation, TransformRoute, assignRouteData, buildTransformRoute, deepAssign} from '@medux/route-plan-a';

interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
  state: any;
}

type UnregisterCallback = () => void;
type LocationListener = (location: BrowserLocation) => void;

export interface History {
  location: BrowserLocation;
  push(path: string, state?: any): void;
  push(location: BrowserLocation): void;
  replace(path: string, state?: any): void;
  replace(location: BrowserLocation): void;
  go(n: number): void;
  goBack(): void;
  goForward(): void;
  listen(listener: LocationListener): UnregisterCallback;
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
}

/**
 * 经过封装后的HistoryAPI比浏览器自带的history更强大
 */
export interface HistoryActions<P = {}> {
  /**
   * 接受监听回调
   */
  listen(listener: LocationListener): UnregisterCallback;
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
  push(data: BrowserRoutePayload<P> | MeduxLocation | string): void;
  /**
   * 同浏览器的history.replace
   * @param data 除了可以接受一个url字符串外，也可以接受medux的RouteData
   */
  replace(data: BrowserRoutePayload<P> | MeduxLocation | string): void;
  /**
   * 同浏览器的history.go
   */
  go(n: number): void;
  /**
   * 同浏览器的history.goBack
   */
  goBack(): void;
  /**
   * 同浏览器的history.goForward
   */
  goForward(): void;
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
  return assignRouteData(routePayload.paths || extend.paths, stackParams);
}

function isBrowserRoutePayload(data: MeduxLocation | BrowserRoutePayload): data is BrowserRoutePayload {
  return !data['pathname'];
}
class BrowserHistoryProxy implements HistoryProxy<BrowserLocation> {
  public initialized = true;
  public constructor(protected history: History, protected locationToRoute: LocationToRoute) {}
  public getLocation() {
    return this.history.location;
  }
  public subscribe(listener: (location: BrowserLocation) => void) {
    return this.history.listen(listener);
  }
  public locationToRouteData(location: BrowserLocation) {
    return location.state || this.locationToRoute(location);
  }
  public equal(a: BrowserLocation, b: BrowserLocation) {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
  }
  public patch(location: BrowserLocation, routeData: RouteData): void {
    this.history.push({...location, state: routeData});
  }
}

/**
 * 创建一个路由解析器
 * @param history 浏览器的history或其代理
 * @param routeConfig 应用的路由配置文件
 * @returns {transformRoute,historyProxy,historyActions,toBrowserUrl}
 */
export function createRouter(history: History, routeConfig: RouteConfig) {
  const transformRoute: TransformRoute = buildTransformRoute(routeConfig);
  const toBrowserUrl: ToBrowserUrl = buildToBrowserUrl(transformRoute.routeToLocation);
  const historyProxy: HistoryProxy<BrowserLocation> = new BrowserHistoryProxy(history, transformRoute.locationToRoute);

  const historyActions: HistoryActions = {
    listen(listener) {
      return history.listen(listener as any);
    },
    getLocation() {
      return history.location;
    },
    getRouteData() {
      return (history.location.state as any) || transformRoute.locationToRoute(history.location);
    },
    push(data) {
      if (typeof data === 'string') {
        history.push(data);
      } else if (isBrowserRoutePayload(data)) {
        const routeData = fillBrowserRouteData(data);
        const location = transformRoute!.routeToLocation(routeData);
        history.push({...location, state: routeData});
      } else {
        history.push({...data, state: undefined});
      }
    },
    replace(data) {
      if (typeof data === 'string') {
        history.replace(data);
      } else if (isBrowserRoutePayload(data)) {
        const routeData = fillBrowserRouteData(data);
        const location = transformRoute!.routeToLocation(routeData);
        history.replace({...location, state: routeData});
      } else {
        history.replace({...data, state: undefined});
      }
    },
    go(n: number) {
      history.go(n);
    },
    goBack() {
      history.goBack();
    },
    goForward() {
      history.goForward();
    },
  };

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
export interface ToBrowserUrl<T = {}> {
  (routeOptions: BrowserRoutePayload<T>): string;
  (pathname: string, search: string, hash: string): string;
}
function buildToBrowserUrl(routeToLocation: RouteToLocation): ToBrowserUrl<any> {
  function toUrl(routeOptions: BrowserRoutePayload<any>): string;
  function toUrl(pathname: string, search: string, hash: string): string;
  function toUrl(...args: any[]): string {
    if (args.length === 1) {
      const location = routeToLocation(fillBrowserRouteData(args[0]));
      args = [location.pathname, location.search, location.hash];
    }
    const [pathname, search, hash] = args as [string, string, string];
    let url = pathname;
    if (search) {
      url += search;
    }
    if (hash) {
      url += hash;
    }
    return url;
  }
  return toUrl;
}
