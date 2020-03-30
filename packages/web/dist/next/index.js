import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';

function isMeduxLocation(data) {
  return !!data['pathname'];
}

class BrowserHistoryProxy {
  constructor(history, locationToRoute) {
    this.history = history;
    this.locationToRoute = locationToRoute;

    _defineProperty(this, "initialized", true);
  }

  getLocation() {
    return this.history.location;
  }

  subscribe(listener) {
    this.history.listen(listener);
  }

  locationToRouteData(location) {
    return location.state || this.locationToRoute(location);
  }

  equal(a, b) {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
  }

  patch(location, routeData) {
    this.history.push(Object.assign({}, location, {
      state: routeData
    }));
  }

}

class HistoryActionsModule {
  constructor(history, routeToLocation) {
    this.history = history;
    this.routeToLocation = routeToLocation;
  }

  push(data) {
    if (typeof data === 'string') {
      this.history.push(data);
    } else if (isMeduxLocation(data)) {
      this.history.push(Object.assign({}, data, {
        state: undefined
      }));
    } else {
      const location = this.routeToLocation(data);
      this.history.push(Object.assign({}, location, {
        state: data
      }));
    }
  }

  replace(data) {
    if (typeof data === 'string') {
      this.history.replace(data);
    } else if (isMeduxLocation(data)) {
      this.history.replace(Object.assign({}, data, {
        state: undefined
      }));
    } else {
      const location = this.routeToLocation(data);
      this.history.replace(Object.assign({}, location, {
        state: data
      }));
    }
  }

  go(n) {
    this.history.go(n);
  }

  goBack() {
    this.history.goBack();
  }

  goForward() {
    this.history.goForward();
  }

}

export function createHistory(history, transformRoute) {
  const historyProxy = new BrowserHistoryProxy(history, transformRoute.locationToRoute);
  const historyActions = new HistoryActionsModule(history, transformRoute.routeToLocation);
  return {
    historyProxy,
    historyActions
  };
}