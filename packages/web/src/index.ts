import {History, LocationListener, UnregisterCallback} from 'history';
import {HistoryProxy, RouteData} from '@medux/core';
import {LocationToRoute, MeduxLocation, RouteConfig, RouteToLocation, TransformRoute, assignRouteData, buildTransformRoute, deepAssign} from '@medux/route-plan-a';

export {createBrowserHistory, createMemoryHistory, createHashHistory} from 'history';

export interface BrowserRoutePayload<P = {}> {
  extend?: RouteData;
  params?: DeepPartial<P>;
  paths?: string[];
}

export interface HistoryActions<P = {}> {
  listen(listener: LocationListener<never>): UnregisterCallback;
  getLocation(): MeduxLocation;
  getRouteData(): RouteData;
  push(data: BrowserRoutePayload<P> | MeduxLocation | string): void;
  replace(data: BrowserRoutePayload<P> | MeduxLocation | string): void;
  go(n: number): void;
  goBack(): void;
  goForward(): void;
}

type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
  state: RouteData;
}

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
    return this.history.location as any;
  }
  public subscribe(listener: (location: BrowserLocation) => void) {
    this.history.listen(listener as any);
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
