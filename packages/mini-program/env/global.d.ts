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
  interface ENV {
    switchTab(option: RouteOption): void;
    reLaunch(option: RouteOption): void;
    redirectTo(option: RouteOption): void;
    navigateTo(option: RouteOption): void;
    navigateBack(option: NavigateBackOption): void;
    getCurrentPages: () => Array<{route: string; options: {[key: string]: string}}>;
  }
}
