import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseHistoryActions } from '@medux/route-plan-a';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { env } from '@medux/core';

function locationToUrl(loaction) {
  return loaction.pathname + loaction.search + loaction.hash;
}

export class WebNativeHistory {
  constructor(createHistory, locationMap) {
    this.locationMap = locationMap;

    _defineProperty(this, "history", void 0);

    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
    } else {
      const [pathname, search = ''] = createHistory.split('?');
      this.history = {
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
          pathname,
          search: search && `?${search}`,
          hash: ''
        }
      };
    }
  }

  block(blocker) {
    return this.history.block((location, action) => {
      return blocker({
        pathname: location.pathname,
        search: location.search,
        hash: location.hash
      }, this.getKey(location), action);
    });
  }

  getUrl() {
    const location = this.locationMap ? this.locationMap.in(this.history.location) : this.history.location;
    return locationToUrl(location);
  }

  getKey(location) {
    return location.state || '';
  }

  push(location) {
    this.history.push(locationToUrl(location), location.key);
  }

  replace(location) {
    this.history.replace(locationToUrl(location), location.key);
  }

  relaunch(location) {
    this.history.push(locationToUrl(location), location.key);
  }

  pop(location, n) {
    if (n < 1000) {
      this.history.go(-n);
    } else {
      this.history.push(locationToUrl(location), location.key);
    }
  }

}
export class HistoryActions extends BaseHistoryActions {
  constructor(nativeHistory, defaultRouteParams, routeRule, locationMap) {
    super(nativeHistory, defaultRouteParams, nativeHistory.getUrl(), routeRule, locationMap);
    this.nativeHistory = nativeHistory;
    this.defaultRouteParams = defaultRouteParams;
    this.routeRule = routeRule;
    this.locationMap = locationMap;

    _defineProperty(this, "_unlistenHistory", void 0);

    _defineProperty(this, "_timer", 0);

    this._unlistenHistory = this.nativeHistory.block((location, key, action) => {
      if (key !== this.getCurKey()) {
        let callback;
        let index = 0;

        if (action === 'POP') {
          index = this.findHistoryByKey(key).index;
        }

        if (index > 0) {
          callback = () => {
            this._timer = 0;
            this.pop(index);
          };
        } else {
          const paLocation = this.locationMap ? this.locationMap.in(location) : location;

          if (action === 'REPLACE') {
            callback = () => {
              this._timer = 0;
              this.replace(paLocation);
            };
          } else if (action === 'PUSH') {
            callback = () => {
              this._timer = 0;
              this.push(paLocation);
            };
          } else {
            callback = () => {
              this._timer = 0;
              this.relaunch(paLocation);
            };
          }
        }

        if (callback && !this._timer) {
          this._timer = env.setTimeout(callback, 50);
        }

        return false;
      }

      return undefined;
    });
  }

  getNativeHistory() {
    return this.nativeHistory.history;
  }

  destroy() {
    this._unlistenHistory();
  }

  refresh() {
    this.nativeHistory.history.go(0);
  }

}
export function createRouter(createHistory, defaultRouteParams, routeRule, locationMap) {
  const nativeHistory = new WebNativeHistory(createHistory);
  const historyActions = new HistoryActions(nativeHistory, defaultRouteParams, routeRule, locationMap);
  return historyActions;
}