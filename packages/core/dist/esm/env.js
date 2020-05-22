export var env = typeof self == 'object' && self.self === self && self || typeof global == 'object' && global.global === global && global || this;
export var isServerEnv = typeof global !== 'undefined' && typeof window === 'undefined';
export var client = isServerEnv ? undefined : typeof window === 'undefined' ? global : window;
export var isDevelopmentEnv = process.env.NODE_ENV !== 'production';