export const env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
export const isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
export const client = isServerEnv ? undefined : env;

env.encodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof btoa === 'function' ? btoa(str) : typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str;
};

env.decodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof atob === 'function' ? atob(str) : typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64').toString() : str;
};