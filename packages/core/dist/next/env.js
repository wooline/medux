export const env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
export const isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
export const isDevelopmentEnv = process.env.NODE_ENV !== 'production';
export const client = isServerEnv ? undefined : env;
let _MEDUX_ENV = {};

try {
  _MEDUX_ENV = process.env.MEDUX_ENV;
} catch (error) {
  _MEDUX_ENV = {};
}

export const MEDUX_ENV = _MEDUX_ENV;