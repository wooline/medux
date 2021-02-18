declare namespace meduxCore {
  type HistoryAcion = 'PUSH' | 'REPLACE' | 'POP';
  interface BrowserLocation {
    pathname: string;
    search: string;
    hash: string;
  }
  type UnregisterCallback = () => void;
  interface History {
    location: BrowserLocation;
    listen(listener: (location: BrowserLocation, action: HistoryAcion) => void): UnregisterCallback;
  }
  interface RouteChangeEvent {
    path: string;
    query: {[key: string]: string};
    openType: string;
  }
  interface ENV {
    onAppRoute(callback: (e: RouteChangeEvent) => void): void;
    getLaunchOptionsSync(): {path: string; query: {[key: string]: string}};
  }
}
declare const process: {env: {TARO_ENV: 'h5'}};
declare const require: (path: string) => any;
