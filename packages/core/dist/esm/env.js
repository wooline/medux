export var env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global;
export var isServerEnv = typeof window === 'undefined' && typeof global === 'object' && global.global === global;
export var client = isServerEnv ? undefined : env;