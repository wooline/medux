import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseHistoryActions, locationToUrl } from '@medux/route-plan-a';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { env } from '@medux/core';
export class WebNativeHistory {
  constructor(createHistory, locationMap) {
    this.locationMap = locationMap;

    _defineProperty(this, "history", void 0);

    _defineProperty(this, "initLocation", void 0);

    _defineProperty(this, "actions", void 0);

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
          state: null,
          pathname,
          search: search && `?${search}`,
          hash: ''
        }
      };
    }

    const location = this.hsLocationToPaLocation(this.history.location);
    this.initLocation = this.locationMap ? this.locationMap.in(location) : location;
  }

  block(blocker) {
    return this.history.block((location, action) => {
      return blocker(this.hsLocationToPaLocation(location), this.getKey(location), action);
    });
  }

  hsLocationToPaLocation(historyLocation) {
    return {
      pathname: historyLocation.pathname,
      search: historyLocation.search,
      hash: historyLocation.hash
    };
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
    this.history.go(-n);
  }

}
export class HistoryActions extends BaseHistoryActions {
  constructor(nativeHistory, homeUrl, routeConfig, maxLength, locationMap) {
    super(nativeHistory, homeUrl, routeConfig, maxLength, locationMap);
    this.nativeHistory = nativeHistory;
    this.homeUrl = homeUrl;
    this.routeConfig = routeConfig;
    this.maxLength = maxLength;
    this.locationMap = locationMap;

    _defineProperty(this, "_unlistenHistory", void 0);

    this._unlistenHistory = this.nativeHistory.block((location, key, action) => {
      if (key !== this.getCurKey()) {
        let callback;
        let index = 0;

        if (action === 'POP') {
          index = this.findHistoryByKey(key).index;
        }

        if (index > 0) {
          callback = () => {
            this.pop(index);
          };
        } else {
          const paLocation = this.locationMap ? this.locationMap.in(location) : location;

          if (action === 'REPLACE') {
            callback = () => {
              this.replace(paLocation);
            };
          } else if (action === 'PUSH') {
            callback = () => {
              this.push(paLocation);
            };
          } else {
            callback = () => {
              this.relaunch(paLocation);
            };
          }
        }

        callback && env.setTimeout(callback, 0);
        return false;
      }

      return undefined;
    });
  }

  destroy() {
    this._unlistenHistory();
  }

}
export function createRouter(createHistory, homeUrl, routeConfig, locationMap) {
  const nativeHistory = new WebNativeHistory(createHistory);
  const historyActions = new HistoryActions(nativeHistory, homeUrl, routeConfig, 10, locationMap);
  nativeHistory.actions = historyActions;
  historyActions.relaunch(nativeHistory.initLocation);
  return historyActions;
}