import {HistoryProxy, RouteData} from '@medux/core';

import {History} from 'history';

export {createBrowserHistory, createMemoryHistory, createHashHistory} from 'history';

interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
  state: RouteData;
}

export interface Location {
  pathname: string;
  search: string;
  hash: string;
}

export type RouteToLocation = (routeData: RouteData) => Location;
export type LocationToRoute = (location: Location) => RouteData;

export interface TransformRoute {
  locationToRoute: LocationToRoute;
  routeToLocation: RouteToLocation;
}

function isLocation(data: RouteData | Location): data is Location {
  return !!data['pathname'];
}

export interface HistoryActions<P = RouteData> {
  push(data: P | Location | string): void;
  replace(data: P | Location | string): void;
  go(n: number): void;
  goBack(): void;
  goForward(): void;
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

class BrowserHistoryActions implements HistoryActions {
  public constructor(protected history: History, protected routeToLocation: RouteToLocation) {}
  public push(data: RouteData | Location | string): void {
    if (typeof data === 'string') {
      this.history.push(data);
    } else if (isLocation(data)) {
      this.history.push({...data, state: undefined});
    } else {
      const location = this.routeToLocation(data as RouteData);
      this.history.push({...location, state: data});
    }
  }
  public replace(data: RouteData | Location | string): void {
    if (typeof data === 'string') {
      this.history.replace(data);
    } else if (isLocation(data)) {
      this.history.replace({...data, state: undefined});
    } else {
      const location = this.routeToLocation(data as RouteData);
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

export function createHistory(history: History, transformRoute: TransformRoute) {
  const historyProxy: HistoryProxy<BrowserLocation> = new BrowserHistoryProxy(history, transformRoute.locationToRoute);
  const historyActions: HistoryActions = new BrowserHistoryActions(history, transformRoute.routeToLocation);
  return {
    historyProxy,
    historyActions,
  };
}
