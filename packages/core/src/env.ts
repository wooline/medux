/// <reference path="../env/global.d.ts" />

declare const window: any;
declare const global: any;
declare const setTimeout: any;
declare const clearTimeout: any;
declare const console: any;

export const env: meduxCore.ENV = (typeof window === 'object' && window.window) ||
  (typeof global === 'object' && global.global) ||
  global || {
    setTimeout,
    clearTimeout,
    console,
  };

env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
