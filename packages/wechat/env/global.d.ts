declare namespace Page {
  interface Constructor {}
}
declare namespace Component {
  interface Constructor {}
}
declare namespace meduxCore {
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
    dispatch?(action: {type: string}): any;
    data?: Props;
    setData?(data: Props): void;
    onLoad?(options: any): void;
    onUnload?(): void;
    onShow?(): void;
    onHide?(): void;
  }

  interface RouteChangeEvent {
    path: string;
    query: {[key: string]: string};
    openType: string;
  }
  interface ENV {
    onAppRoute(callback: (e: RouteChangeEvent) => void): void;
    getLaunchOptionsSync(): {path: string; query: {[key: string]: string}};
    Page: (config: any) => void;
    Component: (config: any) => void;
  }
}
