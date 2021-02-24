import {env} from '@medux/core';
import Taro from '@tarojs/taro';

global.global = {
  getLaunchOptionsSync: Taro.getLaunchOptionsSync,
  switchTab: Taro.switchTab,

  getCurrentPages: Taro.getCurrentPages,
};
if (process.env.TARO_ENV === 'weapp') {
  global.global.onAppRoute = wx.onAppRoute;
}
