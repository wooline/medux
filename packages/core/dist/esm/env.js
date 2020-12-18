export var env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
export var isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
export var isDevelopmentEnv = process.env.NODE_ENV !== 'production';
export var client = isServerEnv ? undefined : env;
var _MEDUX_ENV = {};

try {
  _MEDUX_ENV = process.env.MEDUX_ENV;
} catch (error) {
  _MEDUX_ENV = {};
}

export var MEDUX_ENV = _MEDUX_ENV;