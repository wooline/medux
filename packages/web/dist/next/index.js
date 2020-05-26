import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { assignRouteData, buildTransformRoute, deepAssign } from '@medux/route-plan-a';
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

  return assignRouteData(routePayload.paths || extend.paths, stackParams);
}

function isBrowserRoutePayload(data) {
  return !data['pathname'];
}

export function createRouter(history, routeConfig, locationMap) {
  const transformRoute = buildTransformRoute(routeConfig);
  const toBrowserUrl = buildToBrowserUrl(transformRoute.routeToLocation);

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
      return this.history.listen(listener);
    }

    locationToRouteData(location) {
      return location.state || this.locationToRoute(locationMap ? locationMap.in(location) : location);
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

  const historyProxy = new BrowserHistoryProxy(history, transformRoute.locationToRoute);
  const historyActions = {
    listen(listener) {
      return history.listen(listener);
    },

    getLocation() {
      return history.location;
    },

    getRouteData() {
      return history.location.state || transformRoute.locationToRoute(locationMap ? locationMap.in(history.location) : history.location);
    },

    push(data) {
      if (typeof data === 'string') {
        if (locationMap) {
          let location = urlToBrowserLocation(data);
          location = locationMap.out(location);
          data = browserLocationToUrl(location);
        }

        history.push(data);
      } else if (isBrowserRoutePayload(data)) {
        const routeData = fillBrowserRouteData(data);
        let location = transformRoute.routeToLocation(routeData);

        if (locationMap) {
          location = locationMap.out(location);
        }

        history.push(Object.assign({}, location, {
          state: routeData
        }));
      } else {
        history.push(Object.assign({}, data, {
          state: undefined
        }));
      }
    },

    replace(data) {
      if (typeof data === 'string') {
        if (locationMap) {
          let location = urlToBrowserLocation(data);
          location = locationMap.out(location);
          data = browserLocationToUrl(location);
        }

        history.replace(data);
      } else if (isBrowserRoutePayload(data)) {
        const routeData = fillBrowserRouteData(data);
        let location = transformRoute.routeToLocation(routeData);

        if (locationMap) {
          location = locationMap.out(location);
        }

        history.replace(Object.assign({}, location, {
          state: routeData
        }));
      } else {
        history.replace(Object.assign({}, data, {
          state: undefined
        }));
      }
    },

    go(n) {
      history.go(n);
    },

    goBack() {
      history.goBack();
    },

    goForward() {
      history.goForward();
    }

  };

  function buildToBrowserUrl(routeToLocation) {
    function toUrl(...args) {
      if (args.length === 1) {
        let location = routeToLocation(fillBrowserRouteData(args[0]));

        if (locationMap) {
          location = locationMap.out(location);
        }

        args = [location.pathname, location.search, location.hash];
      }

      const [pathname, search, hash] = args;
      let url = pathname;

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
    transformRoute,
    historyProxy,
    historyActions,
    toBrowserUrl
  };
}

function browserLocationToUrl(location) {
  return location.pathname + (location.search ? `?${location.search}` : '') + (location.hash ? `#${location.hash}` : '');
}

function urlToBrowserLocation(url) {
  const arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  const [pathname, search = '', hash = ''] = arr;
  return {
    pathname,
    search: search && '?' + search,
    hash: hash && '#' + hash
  };
}