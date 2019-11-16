import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
      var _location = this.routeToLocation(data);

      this.history.push(_objectSpread({}, _location, {
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
      var _location2 = this.routeToLocation(data);

      this.history.replace(_objectSpread({}, _location2, {
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
  var historyProxy = new BrowserHistoryProxy(history, transformRoute.locationToRoute);
  var historyActions = new BrowserHistoryActions(history, transformRoute.routeToLocation);
  return {
    historyProxy,
    historyActions
  };
}
//# sourceMappingURL=index.js.map