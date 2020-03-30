import {HistoryProxy, RouteData} from '@medux/core';

import {History} from 'history';

export {createBrowserHistory, createMemoryHistory, createHashHistory} from 'history';

interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
  state: RouteData;
}

export interface MeduxLocation {
  pathname: string;
  search: string;
  hash: string;
}

export type RouteToLocation = (routeData: RouteData) => MeduxLocation;
export type LocationToRoute = (location: MeduxLocation) => RouteData;

export interface TransformRoute {
  locationToRoute: LocationToRoute;
  routeToLocation: RouteToLocation;
}

function isMeduxLocation(data: RouteData | MeduxLocation): data is MeduxLocation {
  return !!data['pathname'];
}

export interface HistoryActions<P = RouteData> {
  push(data: P | MeduxLocation | string): void;
  replace(data: P | MeduxLocation | string): void;
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

class HistoryActionsModule implements HistoryActions {
  public constructor(protected history: History, protected routeToLocation: RouteToLocation) {}
  public push(data: RouteData | MeduxLocation | string): void {
    if (typeof data === 'string') {
      this.history.push(data);
    } else if (isMeduxLocation(data)) {
      this.history.push({...data, state: undefined});
    } else {
      const location = this.routeToLocation(data);
      this.history.push({...location, state: data});
    }
  }
  public replace(data: RouteData | MeduxLocation | string): void {
    if (typeof data === 'string') {
      this.history.replace(data);
    } else if (isMeduxLocation(data)) {
      this.history.replace({...data, state: undefined});
    } else {
      const location = this.routeToLocation(data);
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
  const historyActions: HistoryActions = new HistoryActionsModule(history, transformRoute.routeToLocation);
  return {
    historyProxy,
    historyActions,
  };
}
