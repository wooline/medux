import {HistoryProxy, RouteData} from '@medux/core';
import {LocationToRoute, MeduxLocation, RouteConfig, RouteToLocation, TransformRoute, assignRouteData, buildTransformRoute, deepAssign} from '@medux/route-plan-a';
import {NavigateBackOption, RouteOption, env} from './env';

type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

type UnregisterCallback = () => void;
type LocationListener = (location: MeduxLocation) => void;

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

function isBrowserRoutePayload(data: RouteOption | BrowserRoutePayload): data is BrowserRoutePayload {
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
  switchTab(option: string | BrowserRoutePayload<P> | RouteOption): void;
  reLaunch(option: string | BrowserRoutePayload<P> | RouteOption): void;
  redirectTo(option: string | BrowserRoutePayload<P> | RouteOption): void;
  navigateTo(option: string | BrowserRoutePayload<P> | RouteOption): void;
  navigateBack(option: number | NavigateBackOption): void;
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
    return this.locationToRoute(location);
  }
  public equal(a: MeduxLocation, b: MeduxLocation) {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
  }
  public patch(location: MeduxLocation, routeData: RouteData): void {
    const url = browserLocationToUrl(location);
    this.history.reLaunch({url});
  }
}
/**
 * 创建一个路由解析器
 * @param history 浏览器的history或其代理
 * @param routeConfig 应用的路由配置文件
 * @returns {transformRoute,historyProxy,historyActions,toBrowserUrl}
 */
export function createRouter(routeConfig: RouteConfig) {
  const transformRoute: TransformRoute = buildTransformRoute(routeConfig);
  const toBrowserUrl: ToBrowserUrl = buildToBrowserUrl(transformRoute.routeToLocation);
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

    private createWechatRouteOption(option: string | BrowserRoutePayload<P> | RouteOption): RouteOption {
      if (typeof option === 'string') {
        return {url: option};
      } else if (isBrowserRoutePayload(option)) {
        const routeData = fillBrowserRouteData(option);
        const location = transformRoute!.routeToLocation(routeData);
        return {url: browserLocationToUrl(location)};
      } else {
        return option;
      }
    }
    switchTab(option: string | BrowserRoutePayload<P> | RouteOption): void {
      const routeOption = this.createWechatRouteOption(option);
      this.location = urlToBrowserLocation(routeOption.url);
      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
      env.wx.switchTab(routeOption);
    }
    reLaunch(option: string | BrowserRoutePayload<P> | RouteOption): void {
      const routeOption = this.createWechatRouteOption(option);
      this.location = urlToBrowserLocation(routeOption.url);
      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
      env.wx.reLaunch(routeOption);
    }
    redirectTo(option: string | BrowserRoutePayload<P> | RouteOption): void {
      const routeOption = this.createWechatRouteOption(option);
      this.location = urlToBrowserLocation(routeOption.url);
      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
      env.wx.redirectTo(routeOption);
    }
    navigateTo(option: string | BrowserRoutePayload<P> | RouteOption): void {
      const routeOption = this.createWechatRouteOption(option);
      this.location = urlToBrowserLocation(routeOption.url);
      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
      env.wx.navigateTo(routeOption);
    }
    navigateBack(option: number | NavigateBackOption): void {
      const routeOption: NavigateBackOption = typeof option === 'number' ? {delta: option} : option;
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
