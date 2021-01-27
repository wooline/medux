import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseRouter } from '@medux/route-plan-a';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { env } from '@medux/core';
export class BrowserNativeRouter {
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

  getUrl() {
    const {
      pathname = '',
      search = '',
      hash = ''
    } = this.history.location;
    return [pathname, search, hash].join('');
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

  push(url, key, internal) {
    !internal && this.history.push(url, key);
  }

  replace(url, key, internal) {
    !internal && this.history.replace(url, key);
  }

  relaunch(url, key, internal) {
    !internal && this.history.push(url, key);
  }

  back(url, n, key, internal) {
    !internal && this.history.go(-n);
  }

  pop(url, n, key, internal) {
    !internal && this.history.push(url, key);
  }

}
export class Router extends BaseRouter {
  constructor(browserNativeRouter, locationTransform) {
    super(browserNativeRouter.getUrl(), browserNativeRouter, locationTransform);

    _defineProperty(this, "_unlistenHistory", void 0);

    _defineProperty(this, "_timer", 0);

    this._unlistenHistory = browserNativeRouter.block((url, key, action) => {
      if (key !== this.getCurKey()) {
        let callback;
        let index = 0;

        if (action === 'POP') {
          index = this.history.getActionIndex(key);
        }

        if (index > 0) {
          callback = () => {
            this._timer = 0;
            this.back(index);
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

  destroy() {
    this._unlistenHistory();
  }

}
export function createRouter(createHistory, locationTransform) {
  const browserNativeRouter = new BrowserNativeRouter(createHistory);
  const router = new Router(browserNativeRouter, locationTransform);
  return router;
}