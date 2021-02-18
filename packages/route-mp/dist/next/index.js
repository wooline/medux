import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseRouter } from '@medux/route-web';
import { env } from '@medux/core';
export class MPNativeRouter {
  getLocation() {
    return env.getLocation();
  }

  toUrl(url, key) {
    return url.indexOf('?') > -1 ? `${url}&__key__=${key}` : `${url}?__key__=${key}`;
  }

  onChange(callback) {
    env.onRouteChange((pathname, query, action) => {
      callback(pathname, query, query['__key__'], action);
    });
  }

  push(getUrl, key, internal) {
    !internal && env.navigateTo({
      url: this.toUrl(getUrl(), key)
    });
  }

  replace(getUrl, key, internal) {
    !internal && env.redirectTo({
      url: this.toUrl(getUrl(), key)
    });
  }

  relaunch(getUrl, key, internal) {
    !internal && env.reLaunch({
      url: this.toUrl(getUrl(), key)
    });
  }

  back(getUrl, n, key, internal) {
    !internal && env.navigateBack({
      delta: n
    });
  }

  pop(getUrl, n, key, internal) {
    !internal && env.navigateTo({
      url: this.toUrl(getUrl(), key)
    });
  }

}
export class Router extends BaseRouter {
  constructor(mpNativeRouter, locationTransform) {
    super(mpNativeRouter.getLocation(), mpNativeRouter, locationTransform);

    _defineProperty(this, "nativeRouter", void 0);

    this.nativeRouter = mpNativeRouter;
    mpNativeRouter.onChange((url, query, key, action) => {
      if (key !== this.getCurKey()) {
        if (action === 'POP') {
          const index = this.history.getActionIndex(key);

          if (index > 0) {
            this.back(index);
          }
        } else if (action === 'REPLACE') {
          this.replace(url);
        } else if (action === 'PUSH') {
          this.push(url);
        } else {
          this.relaunch(url);
        }
      }
    });
  }

  destroy() {}

}
export function createRouter(locationTransform) {
  const mpNativeRouter = new MPNativeRouter();
  const router = new Router(mpNativeRouter, locationTransform);
  return router;
}