"use strict";

exports.__esModule = true;
exports.MEDUX_ENV = exports.client = exports.isDevelopmentEnv = exports.isServerEnv = exports.env = void 0;
var env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
exports.env = env;
var isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
exports.isServerEnv = isServerEnv;
var isDevelopmentEnv = process.env.NODE_ENV !== 'production';
exports.isDevelopmentEnv = isDevelopmentEnv;
var client = isServerEnv ? undefined : env;
exports.client = client;
var _MEDUX_ENV = {};

try {
  _MEDUX_ENV = process.env.MEDUX_ENV;
} catch (error) {
  _MEDUX_ENV = {};
}

var MEDUX_ENV = _MEDUX_ENV;
exports.MEDUX_ENV = MEDUX_ENV;