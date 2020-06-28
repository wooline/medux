/* global wx,process,setTimeout,clearTimeout,console */
/// <reference path="../env/global.d.ts" />

// @ts-nocheck

import Taro from '@tarojs/taro';

global.global = {
  getLaunchOptionsSync: Taro.getLaunchOptionsSync,
  switchTab: Taro.switchTab,
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  getCurrentPages: Taro.getCurrentPages,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  console: console,
};
if (process.env.TARO_ENV === 'weapp') {
  global.global.onAppRoute = wx.onAppRoute;
}
