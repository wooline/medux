export const env = typeof self == 'object' && self.self === self && self || typeof global == 'object' && global.global === global && global || this;
export const isServerEnv = typeof global !== 'undefined' && typeof window === 'undefined';
export const client = isServerEnv ? undefined : typeof window === 'undefined' ? global : window;
export const isDevelopmentEnv = process.env.NODE_ENV !== 'production';