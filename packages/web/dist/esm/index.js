import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { assignRouteData, buildTransformRoute, deepAssign } from '@medux/route-plan-a';
export { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';
export function fillBrowserRouteData(routePayload) {
  var extend = routePayload.extend || {
    views: {},
    paths: [],
    stackParams: [],
    params: {}
  };
  var stackParams = [].concat(extend.stackParams);

  if (routePayload.params) {
    stackParams[0] = deepAssign({}, stackParams[0], routePayload.params);
  }

  return assignRouteData(routePayload.paths || extend.paths, stackParams);
}

function isBrowserRoutePayload(data) {
  return !data['pathname'];
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

export function createRouter(history, routeConfig) {
  var transformRoute = buildTransformRoute(routeConfig);
  var toBrowserUrl = buildToBrowserUrl(transformRoute.routeToLocation);
  var historyProxy = new BrowserHistoryProxy(history, transformRoute.locationToRoute);
  var historyActions = {
    listen: function listen(listener) {
      return history.listen(listener);
    },
    getLocation: function getLocation() {
      return history.location;
    },
    getRouteData: function getRouteData() {
      return history.location.state || transformRoute.locationToRoute(history.location);
    },
    push: function push(data) {
      if (typeof data === 'string') {
        history.push(data);
      } else if (isBrowserRoutePayload(data)) {
        var routeData = fillBrowserRouteData(data);

        var _location = transformRoute.routeToLocation(routeData);

        history.push(Object.assign({}, _location, {
          state: routeData
        }));
      } else {
        history.push(Object.assign({}, data, {
          state: undefined
        }));
      }
    },
    replace: function replace(data) {
      if (typeof data === 'string') {
        history.replace(data);
      } else if (isBrowserRoutePayload(data)) {
        var routeData = fillBrowserRouteData(data);

        var _location2 = transformRoute.routeToLocation(routeData);

        history.replace(Object.assign({}, _location2, {
          state: routeData
        }));
      } else {
        history.replace(Object.assign({}, data, {
          state: undefined
        }));
      }
    },
    go: function go(n) {
      history.go(n);
    },
    goBack: function goBack() {
      history.goBack();
    },
    goForward: function goForward() {
      history.goForward();
    }
  };
  return {
    transformRoute: transformRoute,
    historyProxy: historyProxy,
    historyActions: historyActions,
    toBrowserUrl: toBrowserUrl
  };
}

function buildToBrowserUrl(routeToLocation) {
  function toUrl() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 1) {
      var _location3 = routeToLocation(fillBrowserRouteData(args[0]));

      args = [_location3.pathname, _location3.search, _location3.hash];
    }

    var _ref = args,
        pathname = _ref[0],
        search = _ref[1],
        hash = _ref[2];
    var url = pathname;

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