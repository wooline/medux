declare namespace meduxCore {
  interface GeneralCallbackResult {
    errMsg: string;
  }

  type RouteCallback = (res: GeneralCallbackResult) => void;

  interface RouteOption {
    url: string;
    complete?: RouteCallback;
    fail?: RouteCallback;
    success?: RouteCallback;
  }
  interface NavigateBackOption {
    delta?: number;
    complete?: RouteCallback;
    fail?: RouteCallback;
    success?: RouteCallback;
  }
  interface WX {
    getLaunchOptionsSync(): {path: string; query: {[key: string]: string}};
    switchTab(option: RouteOption): void;
    reLaunch(option: RouteOption): void;
    redirectTo(option: RouteOption): void;
    navigateTo(option: RouteOption): void;
    navigateBack(option: NavigateBackOption): void;
  }

  type Props = {[key: string]: any};
  interface ComponentConfig {
    properties?: {[prop: string]: any};
    data?: Props;
    lifetimes?: {
      created?(): void;
      attached?(): void;
      detached?(): void;
    };
    pageLifetimes?: {
      show?(): void;
      hide?(): void;
    };
    methods?: {[method: string]: Function};
    setData?(data: Props): void;
  }
  interface PageConfig {
    data?: Props;
    setData?(data: Props): void;
    onLoad?(options: any): void;
    onUnload?(): void;
    onShow?(): void;
    onHide?(): void;
  }

  interface ENV {
    wx: WX;
    getCurrentPages: () => Array<{route: string; options: {[key: string]: string}}>;
  }
}
