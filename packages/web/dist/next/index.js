import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseHistoryActions, buildTransformRoute, checkLocation, safelocationToUrl, safeurlToLocation } from '@medux/route-plan-a';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
export let Action;

(function (Action) {
  Action["Push"] = "PUSH";
  Action["Pop"] = "POP";
  Action["Replace"] = "REPLACE";
})(Action || (Action = {}));

class WebHistoryActions extends BaseHistoryActions {
  constructor(_history, _transformRoute, _locationMap) {
    super(_locationMap ? _locationMap.in(Object.assign(Object.assign({}, _history.location), {}, {
      action: _history.action
    })) : Object.assign(Object.assign({}, _history.location), {}, {
      action: _history.action
    }), true, _transformRoute);
    this._history = _history;
    this._locationMap = _locationMap;

    _defineProperty(this, "_unlistenHistory", void 0);

    this._unlistenHistory = this._history.block((location, action) => {
      const meduxLocation = _locationMap ? _locationMap.in(Object.assign(Object.assign({}, location), {}, {
        action
      })) : Object.assign(Object.assign({}, location), {}, {
        action
      });

      if (!this.equal(meduxLocation, this.getLocation())) {
        return `${meduxLocation.action}::${safelocationToUrl(meduxLocation)}`;
      }

      return undefined;
    });
  }

  getHistory() {
    return this._history;
  }

  destroy() {
    this._unlistenHistory();
  }

  toUrl(data) {
    let location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    location = this._locationMap ? this._locationMap.out(location) : location;
    return location.pathname + location.search + location.hash;
  }

  patch(location, routeData) {
    this.push(location);
  }

  push(data) {
    const location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    return this.dispatch(Object.assign(Object.assign({}, location), {}, {
      action: Action.Push
    })).then(() => {
      this._history.push(this._locationMap ? this._locationMap.out(location) : location);
    });
  }

  replace(data) {
    const location = typeof data === 'string' ? this._transformRoute.urlToLocation(data) : this._transformRoute.payloadToLocation(data);
    return this.dispatch(Object.assign(Object.assign({}, location), {}, {
      action: Action.Replace
    })).then(() => {
      this._history.replace(this._locationMap ? this._locationMap.out(location) : location);
    });
  }

  go(n) {
    this._history.go(n);
  }

  back() {
    this._history.goBack();
  }

  forward() {
    this._history.goForward();
  }

  passive() {
    throw 1;
  }

}

export function createRouter(createHistory, routeConfig, locationMap) {
  let history;
  const historyOptions = {
    getUserConfirmation(str, callback) {
      const [action, pathname] = str.split('::');
      const location = safeurlToLocation(pathname);
      location.action = action;
      historyActions.dispatch(location).then(() => {
        callback(true);
      }).catch(e => {
        callback(false);
        throw e;
      });
    }

  };

  if (createHistory === 'Hash') {
    history = createHashHistory(historyOptions);
  } else if (createHistory === 'Memory') {
    history = createMemoryHistory(historyOptions);
  } else if (createHistory === 'Browser') {
    history = createBrowserHistory(historyOptions);
  } else {
    const [pathname, search = ''] = createHistory.split('?');
    history = {
      action: 'PUSH',
      length: 0,

      listen() {
        return () => undefined;
      },

      createHref() {
        return '';
      },

      push() {},

      replace() {},

      go() {},

      goBack() {},

      goForward() {},

      block() {
        return () => undefined;
      },

      location: {
        state: null,
        pathname,
        search: search && `?${search}`,
        hash: ''
      }
    };
  }

  const getCurPathname = () => {
    return historyActions.getLocation().pathname;
  };

  const _locationMap = locationMap;

  if (locationMap && _locationMap) {
    _locationMap.in = location => checkLocation(locationMap.in(location), getCurPathname());

    _locationMap.out = location => checkLocation(locationMap.out(location), getCurPathname());
  }

  const transformRoute = buildTransformRoute(routeConfig, getCurPathname);
  const historyActions = new WebHistoryActions(history, transformRoute, _locationMap);
  return {
    transformRoute,
    historyActions
  };
}