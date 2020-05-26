"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.fillBrowserRouteData = fillBrowserRouteData;
exports.createRouter = createRouter;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _routePlanA = require("@medux/route-plan-a");

function fillBrowserRouteData(routePayload) {
  var extend = routePayload.extend || {
    views: {},
    paths: [],
    stackParams: [],
    params: {}
  };
  var stackParams = [].concat(extend.stackParams);

  if (routePayload.params) {
    stackParams[0] = (0, _routePlanA.deepAssign)({}, stackParams[0], routePayload.params);
  }

  return (0, _routePlanA.assignRouteData)(routePayload.paths || extend.paths, stackParams);
}

function isBrowserRoutePayload(data) {
  return !data['pathname'];
}

function createRouter(history, routeConfig, locationMap) {
  var transformRoute = (0, _routePlanA.buildTransformRoute)(routeConfig);
  var toBrowserUrl = buildToBrowserUrl(transformRoute.routeToLocation);

  var BrowserHistoryProxy = function () {
    function BrowserHistoryProxy(history, locationToRoute) {
      this.history = history;
      this.locationToRoute = locationToRoute;
      (0, _defineProperty2.default)(this, "initialized", true);
    }

    var _proto = BrowserHistoryProxy.prototype;

    _proto.getLocation = function getLocation() {
      return this.history.location;
    };

    _proto.subscribe = function subscribe(listener) {
      return this.history.listen(listener);
    };

    _proto.locationToRouteData = function locationToRouteData(location) {
      return location.state || this.locationToRoute(locationMap ? locationMap.in(location) : location);
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

  var historyProxy = new BrowserHistoryProxy(history, transformRoute.locationToRoute);
  var historyActions = {
    listen: function listen(listener) {
      return history.listen(listener);
    },
    getLocation: function getLocation() {
      return history.location;
    },
    getRouteData: function getRouteData() {
      return history.location.state || transformRoute.locationToRoute(locationMap ? locationMap.in(history.location) : history.location);
    },
    push: function push(data) {
      if (typeof data === 'string') {
        if (locationMap) {
          var _location = urlToBrowserLocation(data);

          _location = locationMap.out(_location);
          data = browserLocationToUrl(_location);
        }

        history.push(data);
      } else if (isBrowserRoutePayload(data)) {
        var routeData = fillBrowserRouteData(data);

        var _location2 = transformRoute.routeToLocation(routeData);

        if (locationMap) {
          _location2 = locationMap.out(_location2);
        }

        history.push(Object.assign({}, _location2, {
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
        if (locationMap) {
          var _location3 = urlToBrowserLocation(data);

          _location3 = locationMap.out(_location3);
          data = browserLocationToUrl(_location3);
        }

        history.replace(data);
      } else if (isBrowserRoutePayload(data)) {
        var routeData = fillBrowserRouteData(data);

        var _location4 = transformRoute.routeToLocation(routeData);

        if (locationMap) {
          _location4 = locationMap.out(_location4);
        }

        history.replace(Object.assign({}, _location4, {
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

  function buildToBrowserUrl(routeToLocation) {
    function toUrl() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length === 1) {
        var _location5 = routeToLocation(fillBrowserRouteData(args[0]));

        if (locationMap) {
          _location5 = locationMap.out(_location5);
        }

        args = [_location5.pathname, _location5.search, _location5.hash];
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

  return {
    transformRoute: transformRoute,
    historyProxy: historyProxy,
    historyActions: historyActions,
    toBrowserUrl: toBrowserUrl
  };
}

function browserLocationToUrl(location) {
  return location.pathname + (location.search ? "?" + location.search : '') + (location.hash ? "#" + location.hash : '');
}

function urlToBrowserLocation(url) {
  var arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  var pathname = arr[0],
      _arr$ = arr[1],
      search = _arr$ === void 0 ? '' : _arr$,
      _arr$2 = arr[2],
      hash = _arr$2 === void 0 ? '' : _arr$2;
  return {
    pathname: pathname,
    search: search && '?' + search,
    hash: hash && '#' + hash
  };
}