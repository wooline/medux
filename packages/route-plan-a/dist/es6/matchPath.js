import { compile, pathToRegexp } from './path-to-regexp';
var cache = {};
var cacheLimit = 10000;
var cacheCount = 0;
export function compileToPath(rule) {
  if (cache[rule]) {
    return cache[rule];
  }

  var result = compile(rule);

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

  var cacheKey = "" + options.end + options.strict + options.sensitive;
  var pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) {
    return pathCache[path];
  }

  var keys = [];
  var regexp = pathToRegexp(path, keys, options);
  var result = {
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

  var {
    path,
    exact = false,
    strict = false,
    sensitive = false
  } = options;
  var paths = [].concat(path);
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

    var {
      regexp,
      keys
    } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });
    var match = regexp.exec(pathname);
    if (!match) return null;
    var [url, ...values] = match;
    var isExact = pathname === url;
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