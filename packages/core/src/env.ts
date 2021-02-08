/* global process,global,window */
/// <reference path="../env/global.d.ts" />

// 微信小程序中，window为空，global存在
// @ts-ignore
export const env: meduxCore.ENV = (typeof window === 'object' && window.window) || (typeof global === 'object' && global.global) || global;
// export const env: ENV = (typeof self === 'object' && self.self === self && self) || (typeof global === 'object' && global.global === global && global) || this;
// @ts-ignore
export const isServerEnv: boolean = typeof window === 'undefined' && typeof global === 'object' && global.global === global;

export const client: meduxCore.ENV | undefined = isServerEnv ? undefined : env;

env.encodeBas64 = function (str: string) {
  if (!str) {
    return '';
  }
  // @ts-ignore
  // eslint-disable-next-line no-nested-ternary
  return typeof btoa === 'function' ? btoa(str) : typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str;
};
env.decodeBas64 = function (str: string) {
  if (!str) {
    return '';
  }
  // @ts-ignore
  // eslint-disable-next-line no-nested-ternary
  return typeof atob === 'function' ? atob(str) : typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64').toString() : str;
};

// let _MEDUX_ENV: {[key: string]: any} = {};
// try {
//   // @ts-ignore
//   _MEDUX_ENV = process.env.MEDUX_ENV;
// } catch (error) {
//   _MEDUX_ENV = {};
// }

// export const MEDUX_ENV = _MEDUX_ENV;
