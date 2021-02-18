/* eslint-disable @typescript-eslint/no-use-before-define */
import {BaseRouter, NativeRouter, RootParams, LocationTransform} from '@medux/route-web';
import {History, createBrowserHistory, createHashHistory, createMemoryHistory, Location as HistoryLocation, Action} from 'history';
import {env} from '@medux/core';

type UnregisterCallback = () => void;

export class BrowserNativeRouter implements NativeRouter {
  public history: History<never>;

  private serverSide: boolean = false;

  constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string) {
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
          hash: '',
        } as any,
      };
    }
  }

  getUrl(): string {
    const {pathname = '', search = '', hash = ''} = this.history.location;
    return [pathname, search, hash].join('');
  }

  block(blocker: (url: string, key: string, action: Action) => false | void) {
    return this.history.block((location, action) => {
      const {pathname = '', search = '', hash = ''} = location;
      return blocker([pathname, search, hash].join(''), this.getKey(location), action);
    });
  }

  private getKey(location: HistoryLocation): string {
    return (location.state || '') as string;
  }

  push(getUrl: () => string, key: string, internal: boolean): void {
    !internal && !this.serverSide && this.history.push(getUrl(), key as any);
  }

  replace(getUrl: () => string, key: string, internal: boolean): void {
    !internal && !this.serverSide && this.history.replace(getUrl(), key as any);
  }

  relaunch(getUrl: () => string, key: string, internal: boolean): void {
    !internal && !this.serverSide && this.history.push(getUrl(), key as any);
  }

  back(getUrl: () => string, n: number, key: string, internal: boolean): void {
    !internal && !this.serverSide && this.history.go(-n);
  }

  pop(getUrl: () => string, n: number, key: string, internal: boolean) {
    !internal && !this.serverSide && this.history.push(getUrl(), key as any);
  }

  refresh() {
    this.history.go(0);
  }
}
export class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> {
  private _unlistenHistory: UnregisterCallback;

  private _timer: number = 0;

  public nativeRouter: BrowserNativeRouter;

  constructor(browserNativeRouter: BrowserNativeRouter, locationTransform: LocationTransform<P>) {
    super(browserNativeRouter.getUrl(), browserNativeRouter, locationTransform);
    this.nativeRouter = browserNativeRouter;
    this._unlistenHistory = browserNativeRouter.block((url, key, action) => {
      if (key !== this.getCurKey()) {
        let callback: (() => void) | undefined;
        let index: number = 0;
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

export function createRouter<P extends RootParams, N extends string>(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationTransform: LocationTransform<P>) {
  const browserNativeRouter = new BrowserNativeRouter(createHistory);
  const router = new Router<P, N>(browserNativeRouter, locationTransform);
  return router;
}
