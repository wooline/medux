import {BaseRouter, BaseNativeRouter, NativeData, RootParams, LocationTransform} from '@medux/route-web';
import {History, createBrowserHistory, createHashHistory, createMemoryHistory, Location as HistoryLocation} from 'history';
import {env} from '@medux/core';

type UnregisterCallback = () => void;

export class BrowserNativeRouter extends BaseNativeRouter {
  private _unlistenHistory: UnregisterCallback;

  protected declare router: Router<any, string>;

  public history: History<never>;

  private serverSide: boolean = false;

  constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string) {
    super();
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
    this._unlistenHistory = this.history.block((location, action) => {
      const {pathname = '', search = '', hash = ''} = location;
      const url = [pathname, search, hash].join('');
      const key = this.getKey(location);
      const changed = this.onChange(key);
      if (changed) {
        let index: number = 0;
        let callback: () => void;
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

  getUrl(): string {
    const {pathname = '', search = '', hash = ''} = this.history.location;
    return [pathname, search, hash].join('');
  }

  private getKey(location: HistoryLocation): string {
    return (location.state || '') as string;
  }

  protected passive(url: string, key: string, action: string): boolean {
    return true;
  }

  refresh() {
    this.history.go(0);
  }

  protected push(getNativeData: () => NativeData, key: string, internal: boolean) {
    if (!internal && !this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  protected replace(getNativeData: () => NativeData, key: string, internal: boolean) {
    if (!internal && !this.serverSide) {
      const nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  protected relaunch(getNativeData: () => NativeData, key: string, internal: boolean) {
    if (!internal && !this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  // 只有当native不处理时返回void，否则必须返回NativeData，返回void会导致不依赖onChange来关闭task
  // history.go会触发onChange，所以必须返回NativeData
  protected back(getNativeData: () => NativeData, n: number, key: string, internal: boolean) {
    if (!internal && !this.serverSide) {
      const nativeData = getNativeData();
      this.history.go(-n);
      return nativeData;
    }
    return undefined;
  }

  protected pop(getNativeData: () => NativeData, n: number, key: string, internal: boolean) {
    if (!internal && !this.serverSide) {
      const nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key as any);
      return nativeData;
    }
    return undefined;
  }

  destroy() {
    this._unlistenHistory();
  }
}

export class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> {
  public declare nativeRouter: BrowserNativeRouter;

  constructor(browserNativeRouter: BrowserNativeRouter, locationTransform: LocationTransform<P>) {
    super(browserNativeRouter.getUrl(), browserNativeRouter, locationTransform);
  }
}

export function createRouter<P extends RootParams, N extends string>(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationTransform: LocationTransform<P>) {
  const browserNativeRouter = new BrowserNativeRouter(createHistory);
  const router = new Router<P, N>(browserNativeRouter, locationTransform);
  return router;
}
