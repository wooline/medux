// https://github.com/fjc0k/vtils
import Taro from '@tarojs/taro';
import {PDispatcher, PEvent} from '@medux/core';
import type {RouteENV} from '@medux/route-mp';
import {nativeUrlToNativeLocation} from '@medux/route-web';

declare const require: any;
declare const window: any;

type RouteChangeEventData = {
  pathname: string;
  searchData?: {
    [key: string]: string;
  };
  action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
};

export const eventBus = new PDispatcher<{routeChange: RouteChangeEventData}>();
export const tabPages: {[path: string]: boolean} = {};

function queryToData(query: any = {}): {[key: string]: string} | undefined {
  return Object.keys(query).reduce((params: any, key) => {
    if (!params) {
      params = {};
    }
    params[key] = decodeURIComponent(query[key]);
    return params;
  }, undefined);
}
function routeToUrl(path: string, query: any = {}) {
  path = `/${path.replace(/^\/+|\/+$/g, '')}`;
  const parts: string[] = [];
  Object.keys(query).forEach((key) => {
    parts.push(`${key}=${query[key]}`);
  });

  const queryString = parts.join('&');
  return queryString ? `${path}?${queryString}` : path;
}
let prevPagesInfo: {
  count: number;
  lastPageUrl: string;
};
function patchPageOptions(pageOptions: meduxCore.PageConfig) {
  const onShow = pageOptions.onShow;
  pageOptions.onShow = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    const currentPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options),
    };
    if (prevPagesInfo && (currentPagesInfo.count !== prevPagesInfo.count || currentPagesInfo.lastPageUrl !== prevPagesInfo.lastPageUrl)) {
      const pathname = `/${currentPage.route.replace(/^\/+|\/+$/g, '')}`;
      // eslint-disable-next-line no-nested-ternary
      const action: 'POP' | 'PUSH' | 'REPLACE' = !prevPagesInfo || currentPagesInfo.count > prevPagesInfo.count ? 'PUSH' : currentPagesInfo.count < prevPagesInfo.count ? 'POP' : 'REPLACE';
      let routeAction: 'POP' | 'PUSH' | 'REPLACE' | 'RELAUNCH' = action;
      if (action !== 'POP' && tabPages[pathname]) {
        routeAction = 'RELAUNCH';
      }
      eventBus.dispatch(new PEvent('routeChange', {pathname, searchData: queryToData(currentPage.options), action: routeAction}));
    }
    return onShow?.call(this);
  };

  const onHide = pageOptions.onHide;
  pageOptions.onHide = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    prevPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options),
    };
    return onHide?.call(this);
  };

  const onUnload = pageOptions.onUnload;
  pageOptions.onUnload = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    prevPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options),
    };

    return onUnload?.call(this);
  };

  // const onPullDownRefresh = pageOptions.onPullDownRefresh;
  // pageOptions.onPullDownRefresh = function () {
  //   miniProgramBus.emit({
  //     name: 'currentPagePullDownRefresh',
  //     context: this,
  //     tag: (this as any).__PAGE_ID__,
  //   });
  //   miniProgramBus.emit({name: 'pagePullDownRefresh', context: this});
  //   return onPullDownRefresh?.call(this);
  // };

  // const onReachBottom = pageOptions.onReachBottom;
  // pageOptions.onReachBottom = function () {
  //   miniProgramBus.emit({
  //     name: 'currentPageReachBottom',
  //     context: this,
  //     tag: (this as any).__PAGE_ID__,
  //   });
  //   miniProgramBus.emit({name: 'pageReachBottom', context: this});
  //   return onReachBottom?.call(this);
  // };
}

export const routeENV: RouteENV = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,
  getLocation: () => {
    const arr = Taro.getCurrentPages();
    let path: string;
    let query;
    if (arr.length === 0) {
      ({path, query} = Taro.getLaunchOptionsSync());
    } else {
      const current = arr[arr.length - 1];
      path = current.route;
      query = current.options;
    }
    return {
      pathname: `/${path.replace(/^\/+|\/+$/g, '')}`,
      searchData: queryToData(query),
    };
  },
  onRouteChange(callback) {
    const handler = (e: PEvent<'routeChange', RouteChangeEventData>) => {
      const {pathname, searchData, action} = e.data;
      callback(pathname, searchData, action);
    };
    eventBus.addListener('routeChange', handler);
    return () => eventBus.removeListener('routeChange', handler);
  },
};

if (process.env.TARO_ENV === 'h5') {
  const taroRouter: {
    history: {location: {pathname: string; search: string}; listen: (callback: (location: {pathname: string; search: string}, action: 'POP' | 'PUSH' | 'REPLACE') => void) => () => void};
  } = require('@tarojs/router');
  routeENV.getLocation = () => {
    const {pathname, search} = taroRouter.history.location;
    const nativeLocation = nativeUrlToNativeLocation(pathname + search);
    return {pathname: nativeLocation.pathname, searchData: nativeLocation.searchData};
  };
  routeENV.onRouteChange = (callback) => {
    const unhandle = taroRouter.history.listen((location, action) => {
      const nativeLocation = nativeUrlToNativeLocation([location.pathname, location.search].join(''));
      let routeAction: 'POP' | 'PUSH' | 'REPLACE' | 'RELAUNCH' = action;
      if (action !== 'POP' && tabPages[nativeLocation.pathname]) {
        routeAction = 'RELAUNCH';
      }
      callback(nativeLocation.pathname, nativeLocation.searchData, routeAction);
    });
    return unhandle;
  };
  Taro.onUnhandledRejection = (callback) => {
    window.addEventListener('unhandledrejection', callback, false);
  };
  Taro.onError = (callback) => {
    window.addEventListener('error', callback, false);
  };
} else {
  if (!Taro.onUnhandledRejection) {
    Taro.onUnhandledRejection = () => undefined;
  }
  const originalPage = Page;
  Page = function (pageOptions) {
    patchPageOptions(pageOptions);
    return originalPage(pageOptions);
  };
}
