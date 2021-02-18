/* eslint-disable @typescript-eslint/no-use-before-define */
/// <reference path="../env/global.d.ts" />
import {BaseRouter, NativeRouter, RootParams, LocationTransform} from '@medux/route-web';
import {env} from '@medux/core';

export class MPNativeRouter implements NativeRouter {
  getUrl(): string {
    return env.getCurrentUrl();
  }

  onChange(callback: (pathname: string, query: {[key: string]: string}, key: string, action: 'PUSH' | 'POP' | 'REPLACE') => void) {
    return env.onRouteChange((pathname, query, action) => {
      callback(pathname, query, query['__'], action);
    });
  }

  push(getUrl: () => string, key: string, internal: boolean): void {
    !internal && this.history.push(getUrl(), key as any);
  }

  replace(getUrl: () => string, key: string, internal: boolean): void {
    !internal && this.history.replace(getUrl(), key as any);
  }

  relaunch(getUrl: () => string, key: string, internal: boolean): void {
    !internal && this.history.push(getUrl(), key as any);
  }

  back(getUrl: () => string, n: number, key: string, internal: boolean): void {
    !internal && this.history.go(-n);
  }

  pop(getUrl: () => string, n: number, key: string, internal: boolean) {
    !internal && this.history.push(getUrl(), key as any);
  }

  refresh() {
    this.history.go(0);
  }
}
export class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> {
  public nativeRouter: MPNativeRouter;

  constructor(mpNativeRouter: MPNativeRouter, locationTransform: LocationTransform<P>) {
    super(mpNativeRouter.getUrl(), mpNativeRouter, locationTransform);
    this.nativeRouter = mpNativeRouter;
    mpNativeRouter.onChange((url, key, action) => {
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
