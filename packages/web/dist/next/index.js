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
    return location.state || this.locationToRoute(location);
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

export function createRouter(history, routeConfig) {
  const transformRoute = buildTransformRoute(routeConfig);
  const toBrowserUrl = buildToBrowserUrl(transformRoute.routeToLocation);
  const historyProxy = new BrowserHistoryProxy(history, transformRoute.locationToRoute);
  const historyActions = {
    listen(listener) {
      return history.listen(listener);
    },

    getLocation() {
      return history.location;
    },

    getRouteData() {
      return history.location.state || transformRoute.locationToRoute(history.location);
    },

    push(data) {
      if (typeof data === 'string') {
        history.push(data);
      } else if (isBrowserRoutePayload(data)) {
        const routeData = fillBrowserRouteData(data);
        const location = transformRoute.routeToLocation(routeData);
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
        history.replace(data);
      } else if (isBrowserRoutePayload(data)) {
        const routeData = fillBrowserRouteData(data);
        const location = transformRoute.routeToLocation(routeData);
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
  return {
    transformRoute,
    historyProxy,
    historyActions,
    toBrowserUrl
  };
}

function buildToBrowserUrl(routeToLocation) {
  function toUrl(...args) {
    if (args.length === 1) {
      const location = routeToLocation(fillBrowserRouteData(args[0]));
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