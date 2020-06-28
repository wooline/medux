/* global wx,getCurrentPages,setTimeout,clearTimeout,console,Page,Component */
/// <reference path="../env/global.d.ts" />

// @ts-nocheck
global.global = {
  getLaunchOptionsSync: wx.getLaunchOptionsSync,
  onAppRoute: wx.onAppRoute,
  switchTab: wx.switchTab,
  reLaunch: wx.reLaunch,
  redirectTo: wx.redirectTo,
  navigateTo: wx.navigateTo,
  navigateBack: wx.navigateBack,
  getCurrentPages: getCurrentPages,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  console: console,
  Page: Page,
  Component: Component,
};
