import {BaseRouter, BaseNativeRouter, NativeLocation, NativeData, RootParams, LocationTransform} from '@medux/route-web';

type UnregisterCallback = () => void;
interface RouteOption {
  url: string;
}
interface NavigateBackOption {
  delta?: number;
}

export interface RouteENV {
  onRouteChange(
    callback: (pathname: string, searchData: {[key: string]: string} | undefined, action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH') => void
  ): () => void;
  getLocation(): {pathname: string; searchData: {[key: string]: string} | undefined};
  reLaunch(option: RouteOption): Promise<any>;
  redirectTo(option: RouteOption): Promise<any>;
  navigateTo(option: RouteOption): Promise<any>;
  navigateBack(option: NavigateBackOption): Promise<any>;
  switchTab(option: RouteOption): Promise<any>;
}

export class MPNativeRouter extends BaseNativeRouter {
  private _unlistenHistory: UnregisterCallback;

  protected declare router: Router<any, string>;

  constructor(public routeENV: RouteENV, protected tabPages: {[path: string]: boolean}) {
    super();
    this._unlistenHistory = routeENV.onRouteChange((pathname, searchData, action) => {
      let key = searchData ? searchData['__key__'] : '';
      if (action === 'POP' && !key) {
        key = this.router.history.getRecord(-1)!.key;
      }
      const nativeLocation: NativeLocation = {pathname, searchData};
      const changed = this.onChange(key);
      if (changed) {
        let index: number = -1;
        if (action === 'POP') {
          index = this.router.findHistoryIndex(key);
        }
        if (index > -1) {
          this.router.back(index + 1, '', false, true);
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
    return this.routeENV.getLocation();
  }

  protected toUrl(url: string, key: string): string {
    return url.indexOf('?') > -1 ? `${url}&__key__=${key}` : `${url}?__key__=${key}`;
  }

  protected push(getNativeData: () => NativeData, key: string) {
    const nativeData = getNativeData();
    if (this.tabPages[nativeData.nativeUrl]) {
      throw `Replacing 'push' with 'relaunch' for TabPage: ${nativeData.nativeUrl}`;
    }
    return this.routeENV.navigateTo({url: this.toUrl(nativeData.nativeUrl, key)}).then(() => nativeData);
  }

  protected replace(getNativeData: () => NativeData, key: string) {
    const nativeData = getNativeData();
    if (this.tabPages[nativeData.nativeUrl]) {
      throw `Replacing 'push' with 'relaunch' for TabPage: ${nativeData.nativeUrl}`;
    }
    return this.routeENV.redirectTo({url: this.toUrl(nativeData.nativeUrl, key)}).then(() => nativeData);
  }

  protected relaunch(getNativeData: () => NativeData, key: string) {
    const nativeData = getNativeData();
    if (this.tabPages[nativeData.nativeUrl]) {
      return this.routeENV.switchTab({url: nativeData.nativeUrl}).then(() => nativeData);
    }
    return this.routeENV.reLaunch({url: this.toUrl(nativeData.nativeUrl, key)}).then(() => nativeData);
  }

  // 只有当native不处理时返回void，否则必须返回NativeData，返回void会导致不依赖onChange来关闭task
  // history.go会触发onChange，所以必须返回NativeData
  protected back(getNativeData: () => NativeData, n: number, key: string) {
    const nativeData = getNativeData();
    return this.routeENV.navigateBack({delta: n}).then(() => nativeData);
  }

  toOutside(url: string) {
    // this.history.push(url);
  }

  destroy() {
    this._unlistenHistory();
  }
}

export class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> {
  public declare nativeRouter: MPNativeRouter;

  constructor(mpNativeRouter: MPNativeRouter, locationTransform: LocationTransform<P>) {
    super(mpNativeRouter.getLocation(), mpNativeRouter, locationTransform);
  }
}

export function createRouter<P extends RootParams, N extends string>(
  locationTransform: LocationTransform<P>,
  routeENV: RouteENV,
  tabPages: {[path: string]: boolean}
) {
  const mpNativeRouter = new MPNativeRouter(routeENV, tabPages);
  const router = new Router<P, N>(mpNativeRouter, locationTransform);
  return router;
}
