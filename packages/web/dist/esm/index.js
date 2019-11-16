import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

export { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';

function isLocation(data) {
  return !!data['pathname'];
}

var BrowserHistoryProxy =
/*#__PURE__*/
function () {
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
    this.history.push(_objectSpread({}, location, {
      state: routeData
    }));
  };

  return BrowserHistoryProxy;
}();

var BrowserHistoryActions =
/*#__PURE__*/
function () {
  function BrowserHistoryActions(history, routeToLocation) {
    this.history = history;
    this.routeToLocation = routeToLocation;
  }

  var _proto2 = BrowserHistoryActions.prototype;

  _proto2.push = function push(data) {
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
  };

  _proto2.replace = function replace(data) {
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

  return BrowserHistoryActions;
}();

export function createHistory(history, transformRoute) {
  var historyProxy = new BrowserHistoryProxy(history, transformRoute.locationToRoute);
  var historyActions = new BrowserHistoryActions(history, transformRoute.routeToLocation);
  return {
    historyProxy: historyProxy,
    historyActions: historyActions
  };
}
//# sourceMappingURL=index.js.map