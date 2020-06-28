import { assignRouteData, buildTransformRoute, checkUrl, deepAssign, locationToUrl, urlToLocation } from '@medux/route-plan-a';
export function fillBrowserRouteData(routePayload) {
  const extend = routePayload.extend || {
    views: {},
    paths: [],
    stackParams: [],
    params: {}
  };
  const stackParams = [...extend.stackParams];

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
  const transformRoute = buildTransformRoute(routeConfig);
  const historyProxy = {
    initialized: true,

    getLocation() {
      return Object.assign({}, history.location, {
        action: history.action
      });
    },

    subscribe(listener) {
      const unlink = history.listen((location, action) => {
        listener(Object.assign({}, location, {
          action
        }));
      });
      return unlink;
    },

    locationToRouteData(location) {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(location) : location);
    },

    equal(a, b) {
      return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
    },

    patch(location) {
      const url = locationToUrl(location);
      history.push(url);
    }

  };

  function navigateTo(action, data) {
    if (typeof data === 'string') {
      let url = checkUrl(data, history.location.pathname);

      if (url) {
        if (locationMap) {
          let location = urlToLocation(url);
          location = locationMap.out(location);
          url = checkUrl(locationToUrl(location));
        }
      }

      history[action](url);
    } else if (isBrowserRoutePayload(data)) {
      const routeData = fillBrowserRouteData(data);
      let location = transformRoute.routeToLocation(routeData);

      if (locationMap) {
        location = locationMap.out(location);
      }

      const url = checkUrl(locationToUrl(location));
      history[action](url);
    } else {
      const url = checkUrl(locationToUrl(fillLocation(data)));
      history[action](url);
    }
  }

  const historyActions = {
    listen(listener) {
      const unlink = history.listen((location, action) => {
        listener(Object.assign({}, location, {
          action
        }));
      });
      return unlink;
    },

    getLocation() {
      return Object.assign({}, history.location, {
        action: history.action
      });
    },

    getRouteData() {
      const location = this.getLocation();
      return transformRoute.locationToRoute(locationMap ? locationMap.in(location) : location);
    },

    push(data) {
      navigateTo('push', data);
    },

    replace(data) {
      navigateTo('replace', data);
    },

    go(n) {
      history.go(n);
    },

    back() {
      history.goBack();
    },

    forward() {
      history.goForward();
    }

  };

  function toBrowserUrl(data) {
    let location;

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
    transformRoute,
    historyProxy,
    historyActions,
    toBrowserUrl
  };
}