/* global process */
import {HistoryProxy, RouteData, env} from '@medux/core';
import {MeduxLocation, RouteConfig, TransformRoute, assignRouteData, buildTransformRoute, checkUrl, deepAssign, locationToUrl, urlToLocation} from '@medux/route-plan-a';

type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

type UnregisterCallback = () => void;
type LocationListener = (location: MeduxLocation) => void;
type LocationBlocker = (location: MeduxLocation, curLocation: MeduxLocation) => boolean | Promise<boolean>;

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
  /**
   * 当前路由的打开方式 POP/PUSH
   */
  action?: string;
}

function isBrowserRoutePayload(data: meduxCore.RouteOption | BrowserRoutePayload): data is BrowserRoutePayload {
  return !data['url'];
}
function isBrowserRoutePayload2(data: Partial<MeduxLocation> | BrowserRoutePayload): data is BrowserRoutePayload {
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
export interface HistoryActions<P = {}> {
  getLocation(): MeduxLocation;
  getRouteData(): RouteData;
  switchTab(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void>;
  reLaunch(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void>;
  redirectTo(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void>;
  navigateTo(option: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void>;
  navigateBack(option: number | meduxCore.NavigateBackOption): Promise<void>;
  refresh(method: 'switchTab' | 'reLaunch' | 'redirectTo' | 'navigateTo'): Promise<void>;
  passive(location: MeduxLocation): void;
  equal(a: MeduxLocation, b: MeduxLocation): boolean;
  listen(listener: LocationListener): UnregisterCallback;
  block(blocker: LocationBlocker): UnregisterCallback;
  _dispatch(location: MeduxLocation, action: string): Promise<void>;
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
  return assignRouteData(routePayload.paths || extend.paths, stackParams, undefined, extend.action);
}

/**
 * 创建一个路由解析器
 * @param history 浏览器的history或其代理
 * @param routeConfig 应用的路由配置文件
 * @returns {transformRoute,historyProxy,historyActions,toBrowserUrl}
 */
export function createRouter(routeConfig: RouteConfig, startupUrl: string, locationMap?: LocationMap) {
  const transformRoute: TransformRoute = buildTransformRoute(routeConfig);

  class History<P = {}> implements HistoryActions {
    private _uid = 0;
    private _listenList: {[key: string]: LocationListener} = {};
    private _blockerList: {[key: string]: LocationBlocker} = {};

    public location: MeduxLocation;
    public readonly indexLocation: MeduxLocation;
    constructor() {
      const url = checkUrl(startupUrl);
      this.location = urlToLocation(url)!;
      this.indexLocation = this.location;
    }
    getLocation() {
      return this.location;
    }
    getRouteData() {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(this.location) : this.location);
    }
    private urlToLocation(str: string): {location: MeduxLocation; url: string} {
      let url = checkUrl(str, this.location.pathname);
      let location = urlToLocation(url);
      if (locationMap) {
        location = locationMap.out(location);
        url = checkUrl(locationToUrl(location));
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
        const option: meduxCore.RouteOption = {url: checkUrl(locationToUrl(location))};
        return {option, location};
      } else {
        const {url, location} = this.urlToLocation(data.url);
        return {option: {...data, url}, location};
      }
    }
    switchTab(args: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void> {
      const {location, option} = this.createWechatRouteOption(args);
      return this._dispatch(location, 'PUSH').then(() => {
        env.switchTab(option);
      });
    }
    reLaunch(args: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void> {
      const {location, option} = this.createWechatRouteOption(args);
      return this._dispatch(location, 'PUSH').then(() => {
        env.reLaunch(option);
      });
    }
    redirectTo(args: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void> {
      const {location, option} = this.createWechatRouteOption(args);
      return this._dispatch(location, 'PUSH').then(() => {
        env.redirectTo(option);
      });
    }
    navigateTo(args: string | BrowserRoutePayload<P> | meduxCore.RouteOption): Promise<void> {
      const {location, option} = this.createWechatRouteOption(args);
      return this._dispatch(location, 'PUSH').then(() => {
        env.navigateTo(option);
      });
    }
    navigateBack(option: number | meduxCore.NavigateBackOption): Promise<void> {
      const routeOption: meduxCore.NavigateBackOption = typeof option === 'number' ? {delta: option} : option;
      const pages = env.getCurrentPages();
      if (pages.length < 2) {
        throw {code: '1', message: 'navigateBack:fail cannot navigate back at first page.'};
      }
      const currentPage = pages[pages.length - 1 - (routeOption.delta || 1)];
      let location: MeduxLocation;
      if (currentPage) {
        const {route, options} = currentPage;
        const search = Object.keys(options)
          .map((key) => key + '=' + options[key])
          .join('&');
        const url = checkUrl(route + '?' + search);
        location = urlToLocation(url)!;
      } else {
        location = this.indexLocation;
      }
      return this._dispatch(location, 'POP').then(() => {
        env.navigateBack(routeOption);
      });
    }
    refresh(method: 'switchTab' | 'reLaunch' | 'redirectTo' | 'navigateTo') {
      const option: meduxCore.RouteOption = {url: this.location.pathname + this.location.search};
      return this._dispatch(this.location, 'PUSH').then(() => {
        env[method](option);
      });
    }
    passive(location: MeduxLocation) {
      if (!this.equal(location, this.location)) {
        this._dispatch(location, location.action || 'POP').catch(() => {
          env.navigateTo({url: this.location.pathname + this.location.search});
        });
      }
    }
    equal(a: MeduxLocation, b: MeduxLocation) {
      return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
    }
    async _dispatch(location: MeduxLocation, action: string) {
      const newLocation = {...location, action};
      for (const key in this._blockerList) {
        if (this._blockerList.hasOwnProperty(key)) {
          const blocker = this._blockerList[key];
          const result = await blocker(newLocation, this.location);
          if (!result) {
            throw {code: '2', message: `route blocked:${location.pathname}`};
          }
        }
      }
      this.location = {...location, action};
      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
    }
    listen(listener: LocationListener): UnregisterCallback {
      this._uid++;
      const uid = this._uid;
      this._listenList[uid] = listener;
      return () => {
        delete this._listenList[uid];
      };
    }
    block(listener: LocationBlocker): UnregisterCallback {
      this._uid++;
      const uid = this._uid;
      this._blockerList[uid] = listener;
      return () => {
        delete this._blockerList[uid];
      };
    }
  }
  const historyActions: HistoryActions = new History();

  const historyProxy: HistoryProxy<MeduxLocation> = {
    initialized: true,
    getLocation() {
      return historyActions.getLocation();
    },
    subscribe(listener) {
      return historyActions.listen(listener);
    },
    locationToRouteData(location) {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(location) : location);
    },
    equal(a, b) {
      return historyActions.equal(a, b);
    },
    patch(location): void {
      const url = locationToUrl(location);
      historyActions.reLaunch({url});
    },
  };

  function toBrowserUrl<P = {}>(data: BrowserRoutePayload<P> | Partial<MeduxLocation>) {
    let location: MeduxLocation;
    if (isBrowserRoutePayload2(data)) {
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