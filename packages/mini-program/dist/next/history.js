import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { env } from '@medux/core';
import { assignRouteData, buildTransformRoute, checkUrl, deepAssign, locationToUrl, urlToLocation } from '@medux/route-plan-a';

function isBrowserRoutePayload(data) {
  return !data['url'];
}

function isBrowserRoutePayload2(data) {
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
export function createRouter(routeConfig, startupUrl, locationMap) {
  const transformRoute = buildTransformRoute(routeConfig);

  class History {
    constructor() {
      _defineProperty(this, "_uid", 0);

      _defineProperty(this, "_listenList", {});

      _defineProperty(this, "_blockerList", {});

      _defineProperty(this, "location", void 0);

      _defineProperty(this, "indexLocation", void 0);

      const url = checkUrl(startupUrl);
      this.location = urlToLocation(url);
      this.indexLocation = this.location;
    }

    getLocation() {
      return this.location;
    }

    getRouteData() {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(this.location) : this.location);
    }

    urlToLocation(str) {
      let url = checkUrl(str, this.location.pathname);
      let location = urlToLocation(url);

      if (locationMap) {
        location = locationMap.out(location);
        url = checkUrl(locationToUrl(location));
      }

      return {
        url,
        location
      };
    }

    createWechatRouteOption(data) {
      if (typeof data === 'string') {
        const {
          url,
          location
        } = this.urlToLocation(data);
        return {
          option: {
            url
          },
          location
        };
      } else if (isBrowserRoutePayload(data)) {
        const routeData = fillBrowserRouteData(data);
        let location = transformRoute.routeToLocation(routeData);

        if (locationMap) {
          location = locationMap.out(location);
        }

        const option = {
          url: checkUrl(locationToUrl(location))
        };
        return {
          option,
          location
        };
      } else {
        const {
          url,
          location
        } = this.urlToLocation(data.url);
        return {
          option: Object.assign({}, data, {
            url
          }),
          location
        };
      }
    }

    switchTab(args) {
      const {
        location,
        option
      } = this.createWechatRouteOption(args);
      return this._dispatch(location, 'PUSH').then(() => {
        env.switchTab(option);
      });
    }

    reLaunch(args) {
      const {
        location,
        option
      } = this.createWechatRouteOption(args);
      return this._dispatch(location, 'PUSH').then(() => {
        env.reLaunch(option);
      });
    }

    redirectTo(args) {
      const {
        location,
        option
      } = this.createWechatRouteOption(args);
      return this._dispatch(location, 'PUSH').then(() => {
        env.redirectTo(option);
      });
    }

    navigateTo(args) {
      const {
        location,
        option
      } = this.createWechatRouteOption(args);
      return this._dispatch(location, 'PUSH').then(() => {
        env.navigateTo(option);
      });
    }

    navigateBack(option) {
      const routeOption = typeof option === 'number' ? {
        delta: option
      } : option;
      const pages = env.getCurrentPages();

      if (pages.length < 2) {
        throw {
          code: '1',
          message: 'navigateBack:fail cannot navigate back at first page.'
        };
      }

      const currentPage = pages[pages.length - 1 - (routeOption.delta || 1)];
      let location;

      if (currentPage) {
        const {
          route,
          options
        } = currentPage;
        const search = Object.keys(options).map(key => key + '=' + options[key]).join('&');
        const url = checkUrl(route + '?' + search);
        location = urlToLocation(url);
      } else {
        location = this.indexLocation;
      }

      return this._dispatch(location, 'POP').then(() => {
        env.navigateBack(routeOption);
      });
    }

    refresh(method) {
      const option = {
        url: this.location.pathname + this.location.search
      };
      return this._dispatch(this.location, 'PUSH').then(() => {
        env[method](option);
      });
    }

    passive(location) {
      if (!this.equal(location, this.location)) {
        this._dispatch(location, location.action || 'POP').catch(() => {
          env.navigateTo({
            url: this.location.pathname + this.location.search
          });
        });
      }
    }

    equal(a, b) {
      return a.pathname == b.pathname && a.search == b.search && a.hash == b.hash && a.action == b.action;
    }

    async _dispatch(location, action) {
      const newLocation = Object.assign({}, location, {
        action
      });

      for (const key in this._blockerList) {
        if (this._blockerList.hasOwnProperty(key)) {
          const blocker = this._blockerList[key];
          const result = await blocker(newLocation, this.location);

          if (!result) {
            throw {
              code: '2',
              message: `route blocked:${location.pathname}`
            };
          }
        }
      }

      this.location = Object.assign({}, location, {
        action
      });

      for (const key in this._listenList) {
        if (this._listenList.hasOwnProperty(key)) {
          const listener = this._listenList[key];
          listener(this.location);
        }
      }
    }

    listen(listener) {
      this._uid++;
      const uid = this._uid;
      this._listenList[uid] = listener;
      return () => {
        delete this._listenList[uid];
      };
    }

    block(listener) {
      this._uid++;
      const uid = this._uid;
      this._blockerList[uid] = listener;
      return () => {
        delete this._blockerList[uid];
      };
    }

  }

  const historyActions = new History();
  const historyProxy = {
    initialized: true,

    getLocation() {
      return historyActions.getLocation();
    },

    subscribe(listener) {
      return historyActions.listen(listener);
    },

    locationToRouteData(location) {
      return transformRoute.locationToRoute(locationMap ? locationMap.in(location) : location);
    },

    equal(a, b) {
      return historyActions.equal(a, b);
    },

    patch(location) {
      const url = locationToUrl(location);
      historyActions.reLaunch({
        url
      });
    }

  };

  function toBrowserUrl(data) {
    let location;

    if (isBrowserRoutePayload2(data)) {
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