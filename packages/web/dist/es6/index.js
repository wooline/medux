import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';

function isLocation(data) {
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
    this.history.push(_objectSpread({}, location, {
      state: routeData
    }));
  }

}

class BrowserHistoryActions {
  constructor(history, routeToLocation) {
    this.history = history;
    this.routeToLocation = routeToLocation;
  }

  push(data) {
    if (typeof data === 'string') {
      this.history.push(data);
    } else if (isLocation(data)) {
      this.history.push(data);
    } else {
      const location = this.routeToLocation(data);
      this.history.push(_objectSpread({}, location, {
        state: data
      }));
    }
  }

  replace(data) {
    if (typeof data === 'string') {
      this.history.replace(data);
    } else if (isLocation(data)) {
      this.history.replace(data);
    } else {
      const location = this.routeToLocation(data);
      this.history.replace(_objectSpread({}, location, {
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
  const historyActions = new BrowserHistoryActions(history, transformRoute.routeToLocation);
  return {
    historyProxy,
    historyActions
  };
}
//# sourceMappingURL=index.js.map