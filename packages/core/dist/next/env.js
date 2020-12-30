export const env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
export const isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
export const client = isServerEnv ? undefined : env;