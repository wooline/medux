/* eslint-disable @typescript-eslint/no-use-before-define */
/// <reference path="../env/global.d.ts" />
import {BaseRouter, NativeRouter, RootParams, LocationTransform, NativeLocation} from '@medux/route-web';
import {env} from '@medux/core';

export class MPNativeRouter implements NativeRouter {
  getLocation(): NativeLocation {
    return env.getLocation();
  }

  toUrl(url: string, key: string): string {
    return url.indexOf('?') > -1 ? `${url}&__key__=${key}` : `${url}?__key__=${key}`;
  }

  onChange(callback: (pathname: string, query: {[key: string]: string}, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => void) {
    env.onRouteChange((pathname, query, action) => {
      callback(pathname, query, query['__key__'], action);
    });
  }

  push(getUrl: () => string, key: string, internal: boolean): void {
    !internal && env.navigateTo({url: this.toUrl(getUrl(), key)});
  }

  replace(getUrl: () => string, key: string, internal: boolean): void {
    !internal && env.redirectTo({url: this.toUrl(getUrl(), key)});
  }

  relaunch(getUrl: () => string, key: string, internal: boolean): void {
    !internal && env.reLaunch({url: this.toUrl(getUrl(), key)});
  }

  back(getUrl: () => string, n: number, key: string, internal: boolean): void {
    !internal && env.navigateBack({delta: n});
  }

  pop(getUrl: () => string, n: number, key: string, internal: boolean) {
    !internal && env.navigateTo({url: this.toUrl(getUrl(), key)});
  }
}
export class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> {
  public nativeRouter: MPNativeRouter;

  constructor(mpNativeRouter: MPNativeRouter, locationTransform: LocationTransform<P>) {
    super(mpNativeRouter.getLocation(), mpNativeRouter, locationTransform);
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

export function createRouter<P extends RootParams, N extends string>(locationTransform: LocationTransform<P>) {
  const mpNativeRouter = new MPNativeRouter();
  const router = new Router<P, N>(mpNativeRouter, locationTransform);
  return router;
}
