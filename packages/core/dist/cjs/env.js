"use strict";

exports.__esModule = true;
exports.client = exports.isServerEnv = exports.env = void 0;
var env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
exports.env = env;
var isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
exports.isServerEnv = isServerEnv;
var client = isServerEnv ? undefined : env;
exports.client = client;