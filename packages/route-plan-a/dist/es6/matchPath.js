import pathToRegexp from './path-to-regexp.js';
const cache = {};
const cacheLimit = 10000;
let cacheCount = 0;
export function compileToPath(rule) {
  if (cache[rule]) {
    return cache[rule];
  }

  const result = pathToRegexp.compile(rule);

  if (cacheCount < cacheLimit) {
    cache[rule] = result;
    cacheCount++;
  }

  return result;
}
export function compilePath(path, options) {
  if (options === void 0) {
    options = {
      end: false,
      strict: false,
      sensitive: false
    };
  }

  const cacheKey = "" + options.end + options.strict + options.sensitive;
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) {
    return pathCache[path];
  }

  const keys = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = {
    regexp,
    keys
  };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
}
export function matchPath(pathname, options) {
  if (options === void 0) {
    options = {};
  }

  if (typeof options === 'string' || Array.isArray(options)) {
    options = {
      path: options
    };
  }

  const {
    path,
    exact = false,
    strict = false,
    sensitive = false
  } = options;
  const paths = [].concat(path);
  return paths.reduce((matched, path) => {
    if (!path) return null;
    if (matched) return matched;

    if (path === '*') {
      return {
        path,
        url: pathname,
        isExact: true,
        params: {}
      };
    }

    const {
      regexp,
      keys
    } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });
    const match = regexp.exec(pathname);
    if (!match) return null;
    const [url, ...values] = match;
    const isExact = pathname === url;
    if (exact && !isExact) return null;
    return {
      path,
      // the path used to match
      url: path === '/' && url === '' ? '/' : url,
      // the matched portion of the URL
      isExact,
      // whether or not we matched exactly
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}
export default matchPath;
//# sourceMappingURL=matchPath.js.map