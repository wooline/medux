import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseHistoryActions } from '@medux/route-plan-a';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { env } from '@medux/core';
export class WebNativeHistory {
  constructor(createHistory) {
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

  getLocation() {
    const {
      pathname = '',
      search = '',
      hash = ''
    } = this.history.location;
    return {
      pathname,
      search: decodeURIComponent(search).replace('?', ''),
      hash: decodeURIComponent(hash).replace('#', '')
    };
  }

  getUrl() {
    const {
      pathname = '',
      search = '',
      hash = ''
    } = this.history.location;
    return [pathname, search, hash].join('');
  }

  parseUrl(url) {
    if (!url) {
      return {
        pathname: '/',
        search: '',
        hash: ''
      };
    }

    const arr = url.split(/[?#]/);

    if (arr.length === 2 && url.indexOf('?') < 0) {
      arr.splice(1, 0, '');
    }

    const [pathname, search = '', hash = ''] = arr;
    return {
      pathname,
      search,
      hash
    };
  }

  toUrl(location) {
    return [location.pathname, location.search && `?${location.search}`, location.hash && `#${location.hash}`].join('');
  }

  block(blocker) {
    return this.history.block((location, action) => {
      const {
        pathname = '',
        search = '',
        hash = ''
      } = location;
      return blocker([pathname, search, hash].join(''), this.getKey(location), action);
    });
  }

  getKey(location) {
    return location.state || '';
  }

  push(location, key) {
    this.history.push(this.toUrl(location), key);
  }

  replace(location, key) {
    this.history.replace(this.toUrl(location), key);
  }

  relaunch(location, key) {
    this.history.push(this.toUrl(location), key);
  }

  pop(location, n, key) {
    if (n < 500) {
      this.history.go(-n);
    } else {
      this.history.push(this.toUrl(location), key);
    }
  }

}
export class HistoryActions extends BaseHistoryActions {
  constructor(nativeHistory, locationTransform) {
    super(nativeHistory, locationTransform);
    this.nativeHistory = nativeHistory;

    _defineProperty(this, "_unlistenHistory", void 0);

    _defineProperty(this, "_timer", 0);

    this._unlistenHistory = this.nativeHistory.block((url, key, action) => {
      if (key !== this.getCurKey()) {
        let callback;
        let index = 0;

        if (action === 'POP') {
          index = this.findHistoryByKey(key);
        }

        if (index > 0) {
          callback = () => {
            this._timer = 0;
            this.pop(index);
          };
        } else if (action === 'REPLACE') {
          callback = () => {
            this._timer = 0;
            this.replace(url);
          };
        } else if (action === 'PUSH') {
          callback = () => {
            this._timer = 0;
            this.push(url);
          };
        } else {
          callback = () => {
            this._timer = 0;
            this.relaunch(url);
          };
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
export function createRouter(createHistory, locationTransform) {
  const nativeHistory = new WebNativeHistory(createHistory);
  const historyActions = new HistoryActions(nativeHistory, locationTransform);
  return historyActions;
}