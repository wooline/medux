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
    onRouteChange(callback: (pathname: string, query: {[key: string]: string}, action: 'PUSH' | 'POP' | 'REPLACE') => void): void;
    getLocation(): {pathname: string; query: {[key: string]: string}};
    reLaunch(option: RouteOption): Promise<void>;
    redirectTo(option: RouteOption): Promise<void>;
    navigateTo(option: RouteOption): Promise<void>;
    navigateBack(option: NavigateBackOption): Promise<void>;
    getCurrentPages: () => Array<{route: string; options: {[key: string]: string}}>;
  }
}
