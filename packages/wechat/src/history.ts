import {HistoryProxy, RouteData, env} from '@medux/core';
import {LocationToRoute, MeduxLocation, RouteConfig, RouteToLocation, TransformRoute, assignRouteData, buildTransformRoute, deepAssign} from '@medux/route-plan-a';

type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

type UnregisterCallback = () => void;
type LocationListener = (location: MeduxLocation) => void;

export type LocationToLocation = (location: MeduxLocation) => MeduxLocation;
export type LocationMap = {in: LocationToLocation; out: LocationToLocation};

/**
 * 定义一种数据结构，根据此结构可以生成一个url
 */
interface BrowserRoutePayload<P = {}> {
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

function isBrowserRoutePayload(data: meduxCore.RouteOption | BrowserRoutePayload): data is BrowserRoutePayload {
  return !data['url'];
}

function urlToBrowserLocation(url: string): MeduxLocation {
  const arr = url.split(/[?#]/);
  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }
  const [pathname, search = '', hash = ''] = arr;
  return {
    pathname,
    search: search && '?' + search,
    hash: hash && '#' + hash,
  };
}
function browserLocationToUrl(location: MeduxLocation): string {
  return location.pathname + (location.search ? `?${location.search}` : '') + (location.hash ? `#${location.hash}` : '');
}

export interface HistoryActions<P = {}> {
  location: MeduxLocation;
  getRouteData(): RouteData;
  switchTab(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
  reLaunch(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
  redirectTo(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
  navigateTo(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void;
  navigateBack(option: number | meduxCore.NavigateBackOption): void;
  listen(listener: LocationListener): UnregisterCallback;
}

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

/**
 * 创建一个路由解析器
 * @param history 浏览器的history或其代理
 * @param routeConfig 应用的路由配置文件
 * @returns {transformRoute,historyProxy,historyActions,toBrowserUrl}
 */
export function createRouter(routeConfig: RouteConfig, locationMap?: LocationMap) {
  const transformRoute: TransformRoute = buildTransformRoute(routeConfig);
  const toBrowserUrl: ToBrowserUrl = buildToBrowserUrl(transformRoute.routeToLocation);

  class BrowserHistoryProxy implements HistoryProxy<MeduxLocation> {
    public initialized = true;
    public constructor(protected history: HistoryActions, protected locationToRoute: LocationToRoute) {}
    public getLocation() {
      return this.history.location;
    }
    public subscribe(listener: (location: MeduxLocation) => void) {
      return this.history.listen(listener);
    }
    public locationToRouteData(location: MeduxLocation) {
      return this.locationToRoute(locationMap ? locationMap.in(location) : location);
    }
    public equal(a: MeduxLocation, b: MeduxLocation) {
      return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
    }
    public patch(location: MeduxLocation, routeData: RouteData): void {
      const url = browserLocationToUrl(location);
      this.history.reLaunch({url});
    }
  }
  class History<P = {}> implements HistoryActions {
    private _uid = 0;
    private _listenList: {[key: string]: LocationListener} = {};
    public location: MeduxLocation;
    public readonly indexLocation: MeduxLocation;
    constructor() {
      const {path, query} = env.wx.getLaunchOptionsSync();
      const search = Object.keys(query)
        .map((key) => key + '=' + query[key])
        .join('&');
      this.location = {
        pathname: path,
        search: search && '?' + search,
        hash: '',
      };
      this.indexLocation = this.location;
    }
    getRouteData() {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(this.location) : this.location);
    }
    private urlToLocation(url: string): {location: MeduxLocation; url: string} {
      let location = urlToBrowserLocation(url);
      if (locationMap) {
        location = locationMap.out(location);
        url = browserLocationToUrl(location);
      }
      return {url, location};
    }
    private createWechatRouteOption(data: string | BrowserRoutePayload<P> | meduxCore.RouteOption): {location: MeduxLocation; option: meduxCore.RouteOption} {
      if (typeof data === 'string') {
        const {url, location} = this.urlToLocation(data);
        return {option: {url}, location};
      } else if (isBrowserRoutePayload(data)) {
        const routeData = fillBrowserRouteData(data);
        let location = transformRoute!.routeToLocation(routeData);
        if (locationMap) {
          location = locationMap.out(location);
        }
        const option: meduxCore.RouteOption = {url: browserLocationToUrl(location)};
        return {option, location};
      } else {
        const {url, location} = this.urlToLocation(data.url);
        return {option: {...data, url}, location};
      }
    }
    switchTab(args: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void {
      const {location, option} = this.createWechatRouteOption(args);
      this.location = location;
      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
      env.wx.switchTab(option);
    }
    reLaunch(args: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void {
      const {location, option} = this.createWechatRouteOption(args);
      this.location = location;
      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
      env.wx.reLaunch(option);
    }
    redirectTo(args: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void {
      const {location, option} = this.createWechatRouteOption(args);
      this.location = location;
      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
      env.wx.redirectTo(option);
    }
    navigateTo(args: string | BrowserRoutePayload<P> | meduxCore.RouteOption): void {
      const {location, option} = this.createWechatRouteOption(args);
      this.location = location;
      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
      env.wx.navigateTo(option);
    }
    navigateBack(option: number | meduxCore.NavigateBackOption): void {
      const routeOption: meduxCore.NavigateBackOption = typeof option === 'number' ? {delta: option} : option;
      const pages = env.getCurrentPages();
      const currentPage = pages[pages.length - 1 - (routeOption.delta || 1)];

      if (currentPage) {
        const {route, options} = currentPage;
        const search = Object.keys(options)
          .map((key) => key + '=' + options[key])
          .join('&');
        this.location = {
          pathname: route,
          search: search && '?' + search,
          hash: '',
        };
      } else {
        this.location = this.indexLocation;
      }
      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
      env.wx.navigateBack(routeOption);
    }
    listen(listener: LocationListener): UnregisterCallback {
      this._uid++;
      const uid = this._uid;
      this._listenList[uid] = listener;
      return () => {
        delete this._listenList[uid];
      };
    }
  }
  const historyActions: HistoryActions = new History();
  const historyProxy: HistoryProxy<MeduxLocation> = new BrowserHistoryProxy(historyActions, transformRoute.locationToRoute);

  function buildToBrowserUrl(routeToLocation: RouteToLocation): ToBrowserUrl<any> {
    function toUrl(routeOptions: BrowserRoutePayload<any>): string;
    function toUrl(pathname: string, search: string, hash: string): string;
    function toUrl(...args: any[]): string {
      if (args.length === 1) {
        let location = routeToLocation(fillBrowserRouteData(args[0]));
        if (locationMap) {
          location = locationMap.out(location);
        }
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
