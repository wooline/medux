"use strict";

exports.__esModule = true;
exports.env = void 0;
var env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global || {};
exports.env = env;
env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;