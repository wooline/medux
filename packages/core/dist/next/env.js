export const env = typeof window === 'object' && window.window || typeof global === 'object' && global.global || global || {
  setTimeout,
  clearTimeout,
  console
};
env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;