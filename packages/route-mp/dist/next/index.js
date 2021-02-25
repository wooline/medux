import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseRouter, BaseNativeRouter } from '@medux/route-web';
export class MPNativeRouter extends BaseNativeRouter {
  constructor(env) {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    this.env = env;
    this._unlistenHistory = env.onRouteChange((pathname, searchData, action) => {
      const key = searchData ? searchData['__key__'] : '';
      const nativeLocation = {
        pathname,
        searchData
      };
      const changed = this.onChange(key);

      if (changed) {
        let index = 0;

        if (action === 'POP') {
          index = this.router.searchKeyInActions(key);
        }

        if (index > 0) {
          this.router.back(index, false, true);
        } else if (action === 'REPLACE') {
          this.router.replace(nativeLocation, false, true);
        } else if (action === 'PUSH') {
          this.router.push(nativeLocation, false, true);
        } else {
          this.router.relaunch(nativeLocation, false, true);
        }
      }
    });
  }

  getLocation() {
    return this.env.getLocation();
  }

  toUrl(url, key) {
    return url.indexOf('?') > -1 ? `${url}&__key__=${key}` : `${url}?__key__=${key}`;
  }

  push(getNativeData, key, internal) {
    if (!internal) {
      const nativeData = getNativeData();
      return this.env.navigateTo({
        url: this.toUrl(nativeData.nativeUrl, key)
      }).then(() => nativeData);
    }

    return undefined;
  }

  replace(getNativeData, key, internal) {
    if (!internal) {
      const nativeData = getNativeData();
      return this.env.redirectTo({
        url: this.toUrl(nativeData.nativeUrl, key)
      }).then(() => nativeData);
    }

    return undefined;
  }

  relaunch(getNativeData, key, internal) {
    if (!internal) {
      const nativeData = getNativeData();
      return this.env.reLaunch({
        url: this.toUrl(nativeData.nativeUrl, key)
      }).then(() => nativeData);
    }

    return undefined;
  }

  back(getNativeData, n, key, internal) {
    if (!internal) {
      const nativeData = getNativeData();
      return this.env.navigateBack({
        delta: n
      }).then(() => nativeData);
    }

    return undefined;
  }

  pop(getNativeData, n, key, internal) {
    if (!internal) {
      const nativeData = getNativeData();
      return this.env.reLaunch({
        url: this.toUrl(nativeData.nativeUrl, key)
      }).then(() => nativeData);
    }

    return undefined;
  }

  destroy() {
    this._unlistenHistory();
  }

}
export class Router extends BaseRouter {
  constructor(mpNativeRouter, locationTransform) {
    super(mpNativeRouter.getLocation(), mpNativeRouter, locationTransform);
  }

}
export function createRouter(locationTransform, env) {
  const mpNativeRouter = new MPNativeRouter(env);
  const router = new Router(mpNativeRouter, locationTransform);
  return router;
}