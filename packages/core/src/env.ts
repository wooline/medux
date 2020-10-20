/* eslint-disable @typescript-eslint/ban-ts-comment */
/* global process,global,window */
/// <reference path="../env/global.d.ts" />

// 微信小程序中，window为空，global存在
// @ts-ignore
export const env: meduxCore.ENV = (typeof window === 'object' && window.window) || (typeof global === 'object' && global.global) || global;
// export const env: ENV = (typeof self === 'object' && self.self === self && self) || (typeof global === 'object' && global.global === global && global) || this;
// @ts-ignore
export const isServerEnv: boolean = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
// @ts-ignore
export const isDevelopmentEnv: boolean = process.env.NODE_ENV !== 'production';

export const client: meduxCore.ENV | undefined = isServerEnv ? undefined : env;
