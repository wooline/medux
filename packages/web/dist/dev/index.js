import "core-js/modules/es.string.replace";
import "core-js/modules/es.string.search";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread";
import { createBrowserHistory, createMemoryHistory } from 'history';
import { isServer } from '@medux/core';

function isLocation(data) {
  return !data['views'];
}

var BrowserHistoryProxy =
/*#__PURE__*/
function () {
  function BrowserHistoryProxy(history, locationToRoute) {
    this.history = history;
    this.locationToRoute = locationToRoute;
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
      this.history.push(data);
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

export function createHistory(options) {
  var history = isServer() ? createMemoryHistory(options) : createBrowserHistory(options);
  var historyProxy = new BrowserHistoryProxy(history, options.locationToRoute);
  var historyActions = new BrowserHistoryActions(history, options.routeToLocation);
  return {
    history: history,
    historyProxy: historyProxy,
    historyActions: historyActions
  };
}
//# sourceMappingURL=index.js.map