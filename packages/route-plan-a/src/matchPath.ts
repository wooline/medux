import pathToRegexp, {Key, PathFunction} from './path-to-regexp.js';

const cache = {};
const cacheLimit = 10000;
let cacheCount = 0;

export function compileToPath(rule: string): PathFunction {
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
export function compilePath(path: string, options: {end: boolean; strict: boolean; sensitive: boolean} = {end: false, strict: false, sensitive: false}): {regexp: RegExp; keys: Key[]} {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) {
    return pathCache[path];
  }

  const keys: any[] = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = {regexp, keys};

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
}
interface MatchResult {
  params: {[key: string]: string};
  isExact: boolean;
  path: string;
  url: string;
}
interface MatchPathOptions {
  path?: string | string[];
  strict?: boolean;
  exact?: boolean;
  sensitive?: boolean;
}

export function matchPath(pathname: string, options: string | string[] | MatchPathOptions = {}): MatchResult {
  if (typeof options === 'string' || Array.isArray(options)) {
    options = {path: options};
  }

  const {path, exact = false, strict = false, sensitive = false} = options;

  const paths = [].concat(path as any);

  return paths.reduce(
    (matched, path: string) => {
      if (!path) return null;
      if (matched) return matched;
      if (path === '*') {
        return {
          path,
          url: pathname,
          isExact: true,
          params: {},
        };
      }
      const {regexp, keys} = compilePath(path, {
        end: exact,
        strict,
        sensitive,
      });
      const match = regexp.exec(pathname);

      if (!match) return null;

      const [url, ...values] = match;
      const isExact = pathname === url;

      if (exact && !isExact) return null;

      return {
        path, // the path used to match
        url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
        isExact, // whether or not we matched exactly
        params: keys.reduce((memo: {[key: string]: any}, key: {name: string | number}, index: number) => {
          memo[key.name] = values[index];
          return memo;
        }, {}),
      };
    },
    null as any
  );
}

export default matchPath;
