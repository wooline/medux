import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';

function isMeduxLocation(data) {
  return !!data['pathname'];
}

var BrowserHistoryProxy = function () {
  function BrowserHistoryProxy(history, locationToRoute) {
    this.history = history;
    this.locationToRoute = locationToRoute;

    _defineProperty(this, "initialized", true);
  }

  var _proto = BrowserHistoryProxy.prototype;

  _proto.getLocation = function getLocation() {
    return this.history.location;
  };

  _proto.subscribe = function subscribe(listener) {
    this.history.listen(listener);
  };

  _proto.locationToRouteData = function locationToRouteData(location) {
    return location.state || this.locationToRoute(location);
  };

  _proto.equal = function equal(a, b) {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
  };

  _proto.patch = function patch(location, routeData) {
    this.history.push(Object.assign({}, location, {
      state: routeData
    }));
  };

  return BrowserHistoryProxy;
}();

var HistoryActionsModule = function () {
  function HistoryActionsModule(history, routeToLocation) {
    this.history = history;
    this.routeToLocation = routeToLocation;
  }

  var _proto2 = HistoryActionsModule.prototype;

  _proto2.push = function push(data) {
    if (typeof data === 'string') {
      this.history.push(data);
    } else if (isMeduxLocation(data)) {
      this.history.push(Object.assign({}, data, {
        state: undefined
      }));
    } else {
      var _location = this.routeToLocation(data);

      this.history.push(Object.assign({}, _location, {
        state: data
      }));
    }
  };

  _proto2.replace = function replace(data) {
    if (typeof data === 'string') {
      this.history.replace(data);
    } else if (isMeduxLocation(data)) {
      this.history.replace(Object.assign({}, data, {
        state: undefined
      }));
    } else {
      var _location2 = this.routeToLocation(data);

      this.history.replace(Object.assign({}, _location2, {
        state: data
      }));
    }
  };

  _proto2.go = function go(n) {
    this.history.go(n);
  };

  _proto2.goBack = function goBack() {
    this.history.goBack();
  };

  _proto2.goForward = function goForward() {
    this.history.goForward();
  };

  return HistoryActionsModule;
}();

export function createHistory(history, transformRoute) {
  var historyProxy = new BrowserHistoryProxy(history, transformRoute.locationToRoute);
  var historyActions = new HistoryActionsModule(history, transformRoute.routeToLocation);
  return {
    historyProxy: historyProxy,
    historyActions: historyActions
  };
}