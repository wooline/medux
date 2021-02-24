import {BaseRouter, BaseNativeRouter, NativeLocation, NativeData, RootParams, LocationTransform} from '@medux/route-web';

type UnregisterCallback = () => void;
interface RouteOption {
  url: string;
}
interface NavigateBackOption {
  delta?: number;
}

export interface RouteENV {
  onRouteChange(callback: (pathname: string, query: {[key: string]: string}, action: 'PUSH' | 'POP' | 'REPLACE') => void): () => void;
  getLocation(): {pathname: string; query: {[key: string]: string}};
  reLaunch(option: RouteOption): Promise<void>;
  redirectTo(option: RouteOption): Promise<void>;
  navigateTo(option: RouteOption): Promise<void>;
  navigateBack(option: NavigateBackOption): Promise<void>;
  getCurrentPages: () => Array<{route: string; options: {[key: string]: string}}>;
}

export class MPNativeRouter extends BaseNativeRouter {
  private _unlistenHistory: UnregisterCallback;

  protected router!: Router<any, string>;

  constructor(public env: RouteENV) {
    super();
    this._unlistenHistory = env.onRouteChange((pathname, query, action) => {
      const key = query['__key__'];
      const nativeLocation: NativeLocation = {pathname, searchData: query || undefined};
      const changed = this.onChange(key);
      if (changed) {
        let index: number = 0;
        if (action === 'POP') {
          index = this.router.searchKey(key);
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

  getLocation(): NativeLocation {
    return this.env.getLocation();
  }

  protected toUrl(url: string, key: string): string {
    return url.indexOf('?') > -1 ? `${url}&__key__=${key}` : `${url}?__key__=${key}`;
  }

  protected push(getNativeData: () => NativeData, key: string, internal: boolean) {
    if (!internal) {
      const nativeData = getNativeData();
      return this.env.navigateTo({url: this.toUrl(nativeData.nativeUrl, key)}).then(() => nativeData);
    }
    return undefined;
  }

  protected replace(getNativeData: () => NativeData, key: string, internal: boolean) {
    if (!internal) {
      const nativeData = getNativeData();
      return this.env.redirectTo({url: this.toUrl(nativeData.nativeUrl, key)}).then(() => nativeData);
    }
    return undefined;
  }

  protected relaunch(getNativeData: () => NativeData, key: string, internal: boolean) {
    if (!internal) {
      const nativeData = getNativeData();
      return this.env.reLaunch({url: this.toUrl(nativeData.nativeUrl, key)}).then(() => nativeData);
    }
    return undefined;
  }

  // 只有当native不处理时返回void，否则必须返回NativeData，返回void会导致不依赖onChange来关闭task
  // history.go会触发onChange，所以必须返回NativeData
  protected back(getNativeData: () => NativeData, n: number, key: string, internal: boolean) {
    if (!internal) {
      const nativeData = getNativeData();
      return this.env.navigateBack({delta: n}).then(() => nativeData);
    }
    return undefined;
  }

  protected pop(getNativeData: () => NativeData, n: number, key: string, internal: boolean) {
    if (!internal) {
      const nativeData = getNativeData();
      return this.env.reLaunch({url: this.toUrl(nativeData.nativeUrl, key)}).then(() => nativeData);
    }
    return undefined;
  }

  destroy() {
    this._unlistenHistory();
  }
}

export class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> {
  public nativeRouter!: MPNativeRouter;

  constructor(mpNativeRouter: MPNativeRouter, locationTransform: LocationTransform<P>) {
    super(mpNativeRouter.getLocation(), mpNativeRouter, locationTransform);
  }

  searchKey(key: string) {
    return this.history.getActionIndex(key);
  }
}

export function createRouter<P extends RootParams, N extends string>(locationTransform: LocationTransform<P>, env: RouteENV) {
  const mpNativeRouter = new MPNativeRouter(env);
  const router = new Router<P, N>(mpNativeRouter, locationTransform);
  return router;
}
