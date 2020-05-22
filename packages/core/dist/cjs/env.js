"use strict";

exports.__esModule = true;
exports.isDevelopmentEnv = exports.client = exports.isServerEnv = exports.env = void 0;
var env = typeof self == 'object' && self.self === self && self || typeof global == 'object' && global.global === global && global || void 0;
exports.env = env;
var isServerEnv = typeof global !== 'undefined' && typeof window === 'undefined';
exports.isServerEnv = isServerEnv;
var client = isServerEnv ? undefined : typeof window === 'undefined' ? global : window;
exports.client = client;
var isDevelopmentEnv = process.env.NODE_ENV !== 'production';
exports.isDevelopmentEnv = isDevelopmentEnv;