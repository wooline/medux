import { assignRouteData, buildTransformRoute, checkUrl, deepAssign, locationToUrl, urlToLocation } from '@medux/route-plan-a';
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

  return assignRouteData(routePayload.paths || extend.paths, stackParams, undefined, extend.action);
}

function isBrowserRoutePayload(data) {
  return !data['pathname'];
}

function fillLocation(location) {
  return {
    pathname: location.pathname || '',
    search: location.search || '',
    hash: location.hash || '',
    action: location.action
  };
}

export function createRouter(history, routeConfig, locationMap) {
  var transformRoute = buildTransformRoute(routeConfig);
  var historyProxy = {
    initialized: true,
    getLocation: function getLocation() {
      return Object.assign({}, history.location, {
        action: history.action
      });
    },
    subscribe: function subscribe(listener) {
      var unlink = history.listen(function (location, action) {
        listener(Object.assign({}, location, {
          action: action
        }));
      });
      return unlink;
    },
    locationToRouteData: function locationToRouteData(location) {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(location) : location);
    },
    equal: function equal(a, b) {
      return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
    },
    patch: function patch(location) {
      var url = locationToUrl(location);
      history.push(url);
    }
  };

  function navigateTo(action, data) {
    if (typeof data === 'string') {
      var url = checkUrl(data, history.location.pathname);

      if (url) {
        if (locationMap) {
          var _location = urlToLocation(url);

          _location = locationMap.out(_location);
          url = checkUrl(locationToUrl(_location));
        }
      }

      history[action](url);
    } else if (isBrowserRoutePayload(data)) {
      var routeData = fillBrowserRouteData(data);

      var _location2 = transformRoute.routeToLocation(routeData);

      if (locationMap) {
        _location2 = locationMap.out(_location2);
      }

      var _url = checkUrl(locationToUrl(_location2));

      history[action](_url);
    } else {
      var _url2 = checkUrl(locationToUrl(fillLocation(data)));

      history[action](_url2);
    }
  }

  var historyActions = {
    listen: function listen(listener) {
      var unlink = history.listen(function (location, action) {
        listener(Object.assign({}, location, {
          action: action
        }));
      });
      return unlink;
    },
    getLocation: function getLocation() {
      return Object.assign({}, history.location, {
        action: history.action
      });
    },
    getRouteData: function getRouteData() {
      var location = this.getLocation();
      return transformRoute.locationToRoute(locationMap ? locationMap.in(location) : location);
    },
    push: function push(data) {
      navigateTo('push', data);
    },
    replace: function replace(data) {
      navigateTo('replace', data);
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

  function toBrowserUrl(data) {
    var location;

    if (isBrowserRoutePayload(data)) {
      location = transformRoute.routeToLocation(fillBrowserRouteData(data));
    } else {
      location = fillLocation(data);
    }

    if (locationMap) {
      location = locationMap.out(location);
    }

    return checkUrl(locationToUrl(location));
  }

  return {
    transformRoute: transformRoute,
    historyProxy: historyProxy,
    historyActions: historyActions,
    toBrowserUrl: toBrowserUrl
  };
}