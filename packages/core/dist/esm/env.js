export var env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global || {
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  console: console
};
env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;