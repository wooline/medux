import {BrowserHistoryBuildOptions, History, MemoryHistoryBuildOptions, createBrowserHistory, createMemoryHistory} from 'history';
import {DisplayViews, HistoryProxy, RouteData} from '@medux/core/types/export';

import {isServer} from '@medux/core';

interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: RouteData;
}

export interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
}
type Params = RouteData['params'];
export interface RoutePayload<P extends Params = Params> {
  params: P;
  paths: string[];
}
export type RouteToLocation = (routeData: RoutePayload) => BrowserLocation;
export type LocationToRoute = (location: BrowserLocation) => RouteData;

export interface TransformRoute {
  locationToRoute: LocationToRoute;
  routeToLocation: RouteToLocation;
}

export type BrowserHistoryOptions = BrowserHistoryBuildOptions & TransformRoute;
export type MemoryHistoryOptions = MemoryHistoryBuildOptions & TransformRoute;
function isLocation(data: RoutePayload | BrowserLocation): data is Location {
  return !data['params'] && !data['paths'];
}

export interface HistoryActions<P extends Params = Params> {
  push(data: RoutePayload<P> | BrowserLocation | string): void;
  replace(data: RoutePayload<P> | BrowserLocation | string): void;
  go(n: number): void;
  goBack(): void;
  goForward(): void;
}
class BrowserHistoryProxy implements HistoryProxy<Location> {
  public constructor(protected history: History, protected locationToRoute: LocationToRoute) {}
  public getLocation() {
    return this.history.location;
  }
  public subscribe(listener: (location: Location) => void) {
    this.history.listen(listener);
  }
  public locationToRouteData(location: Location) {
    return location.state || this.locationToRoute(location);
  }
  public equal(a: Location, b: Location) {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
  }
  public patch(location: Location, routeData: RouteData): void {
    this.history.push({...location, state: routeData});
  }
}

class BrowserHistoryActions implements HistoryActions {
  public constructor(protected history: History, protected routeToLocation: RouteToLocation) {}
  public push(data: RoutePayload | BrowserLocation | string): void {
    if (typeof data === 'string') {
      this.history.push(data);
    } else if (isLocation(data)) {
      this.history.push(data);
    } else {
      const routeData = data as RoutePayload;
      const location = this.routeToLocation(routeData);
      const views: DisplayViews = routeData.paths.reduce((prev: DisplayViews, cur) => {
        const [moduleName, viewName] = cur.split('.');
        if (viewName) {
          if (!prev[moduleName]) {
            prev[moduleName] = {};
          }
          prev[moduleName][viewName] = true;
        }
        return prev;
      }, {});
      this.history.push({...location, state: {...routeData, views}});
    }
  }
  public replace(data: RoutePayload | BrowserLocation | string): void {
    if (typeof data === 'string') {
      this.history.replace(data);
    } else if (isLocation(data)) {
      this.history.push(data);
    } else {
      const location = this.routeToLocation(data as RoutePayload);
      this.history.replace({...location, state: data});
    }
  }
  public go(n: number) {
    this.history.go(n);
  }
  public goBack() {
    this.history.goBack();
  }
  public goForward() {
    this.history.goForward();
  }
}

export function createHistory(options: BrowserHistoryOptions | MemoryHistoryOptions) {
  const history = isServer() ? createMemoryHistory(options) : createBrowserHistory(options);
  const historyProxy: HistoryProxy<Location> = new BrowserHistoryProxy(history, options.locationToRoute);
  const historyActions: HistoryActions = new BrowserHistoryActions(history, options.routeToLocation);
  return {
    history,
    historyProxy,
    historyActions,
  };
}
