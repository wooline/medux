declare module '@tarojs/taro' {
  const reLaunch: any;
  const redirectTo: any;
  const navigateTo: any;
  const navigateBack: any;
  const getCurrentPages: () => Array<{route: string; options?: {[key: string]: string}}>;
  const getLaunchOptionsSync: any;
  const switchTab: any;
  let onUnhandledRejection: (callback: (e: {reason: any}) => void) => void;
}
declare module '@tarojs/components' {
  const View: any;
}
declare const process: {
  GlobalVar: any;
  env: {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd';
    [key: string]: any;
  };
};
declare let Page: (options: any) => void;
