import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseRouter, BaseNativeRouter } from '@medux/route-web';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { env } from '@medux/core';
export class BrowserNativeRouter extends BaseNativeRouter {
  constructor(createHistory) {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    _defineProperty(this, "router", void 0);

    _defineProperty(this, "history", void 0);

    _defineProperty(this, "serverSide", false);

    if (createHistory === 'Hash') {
      this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      this.history = createBrowserHistory();
    } else {
      this.serverSide = true;
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

    this._unlistenHistory = this.history.block((location, action) => {
      const {
        pathname = '',
        search = '',
        hash = ''
      } = location;
      const url = [pathname, search, hash].join('');
      const key = this.getKey(location);
      const changed = this.onChange(key);

      if (changed) {
        let index = 0;
        let callback;

        if (action === 'POP') {
          index = this.router.searchKeyInActions(key);
        }

        if (index > 0) {
          callback = () => this.router.back(index);
        } else if (action === 'REPLACE') {
          callback = () => this.router.replace(url);
        } else if (action === 'PUSH') {
          callback = () => this.router.push(url);
        } else {
          callback = () => this.router.relaunch(url);
        }

        callback && env.setTimeout(callback, 50);
        return false;
      }

      return undefined;
    });
  }

  getUrl() {
    const {
      pathname = '',
      search = '',
      hash = ''
    } = this.history.location;
    return [pathname, search, hash].join('');
  }

  getKey(location) {
    return location.state || '';
  }

  passive(url, key, action) {
    return true;
  }

  refresh() {
    this.history.go(0);
  }

  push(getNativeData, key, internal) {
    if (!internal && !this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  replace(getNativeData, key, internal) {
    if (!internal && !this.serverSide) {
      const nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  relaunch(getNativeData, key, internal) {
    if (!internal && !this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  back(getNativeData, n, key, internal) {
    if (!internal && !this.serverSide) {
      const nativeData = getNativeData();
      this.history.go(-n);
      return nativeData;
    }

    return undefined;
  }

  pop(getNativeData, n, key, internal) {
    if (!internal && !this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  }

  destroy() {
    this._unlistenHistory();
  }

}
export class Router extends BaseRouter {
  constructor(browserNativeRouter, locationTransform) {
    super(browserNativeRouter.getUrl(), browserNativeRouter, locationTransform);

    _defineProperty(this, "nativeRouter", void 0);
  }

}
export function createRouter(createHistory, locationTransform) {
  const browserNativeRouter = new BrowserNativeRouter(createHistory);
  const router = new Router(browserNativeRouter, locationTransform);
  return router;
}