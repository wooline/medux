declare namespace meduxCore {
  interface ENV {
    __taroAppConfig: {
      tabBar: {list: {pagePath: string}[]};
    };
  }

  interface PageConfig {
    dispatch?(action: {type: string}): any;
    onLoad?(options: any): void;
    onUnload?(): void;
    onShow?(): void;
    onHide?(): void;
  }
}

declare namespace Taro {
  let onUnhandledRejection: (callback: (error: {reason: any}) => void) => void;
}
