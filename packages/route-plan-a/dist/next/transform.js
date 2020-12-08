import { deepExtend, extendDefault, excludeDefault, splitPrivate } from './deep-extend';
import { extractPathParams } from './matchPath';

function splitSearch(search, key) {
  const reg = new RegExp(`[?&#]${key}=([^&]+)`);
  const arr = search.match(reg);
  return arr ? arr[1] : '';
}

function assignDefaultData(data, def) {
  return Object.keys(data).reduce((params, moduleName) => {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

function encodeBas64(str) {
  return btoa ? btoa(str) : Buffer ? Buffer.from(str).toString('base64') : str;
}

function decodeBas64(str) {
  return atob ? atob(str) : Buffer ? Buffer.from(str, 'base64').toString() : str;
}

function parseWebNativeLocation(nativeLocation, key, base64, parse) {
  let search = key ? splitSearch(nativeLocation.search, key) : nativeLocation.search;
  let hash = key ? splitSearch(nativeLocation.hash, key) : nativeLocation.hash;

  if (base64) {
    search = search && decodeBas64(search);
    hash = hash && decodeBas64(hash);
  }

  const pathname = `/${nativeLocation.pathname}`.replace(/\/+/g, '/');
  return {
    pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
    search: search ? parse(search) : undefined,
    hash: hash ? parse(hash) : undefined
  };
}

function toNativeLocation(tag, search, hash, key, base64, stringify) {
  let searchStr = search ? stringify(search) : '';
  let hashStr = hash ? stringify(hash) : '';

  if (base64) {
    searchStr = searchStr && encodeBas64(searchStr);
    hashStr = hashStr && encodeBas64(hashStr);
  }

  const pathname = `/${tag}`.replace(/\/+/g, '/');
  return {
    pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
    search: key ? `${key}=${searchStr}` : searchStr,
    hash: key ? `${key}=${hashStr}` : hashStr
  };
}

export function isLocationMap(data) {
  if (typeof data.in === 'function' && typeof data.out === 'function') {
    return true;
  }

  return false;
}
export function createWebLocationTransform(defaultData, pathnameRules, base64 = false, serialization = JSON, key = '') {
  const matchCache = {
    _cache: {},

    get(pathname) {
      if (this._cache[pathname]) {
        const {
          tag,
          pathParams
        } = this._cache[pathname];
        return {
          tag,
          pathParams: JSON.parse(pathParams)
        };
      }

      return undefined;
    },

    set(pathname, tag, pathParams) {
      const keys = Object.keys(this._cache);

      if (keys.length > 100) {
        delete this._cache[keys[0]];
      }

      this._cache[pathname] = {
        tag,
        pathParams: JSON.stringify(pathParams)
      };
    }

  };
  return {
    in(nativeLocation) {
      const {
        pathname,
        search,
        hash
      } = parseWebNativeLocation(nativeLocation, key, base64, serialization.parse);
      const data = {
        tag: pathname,
        params: {}
      };

      if (pathnameRules) {
        let {
          pathParams,
          tag
        } = matchCache.get(pathname) || {};

        if (!tag || !pathParams) {
          pathParams = {};
          tag = extractPathParams(pathnameRules, pathname, pathParams);
          matchCache.set(pathname, tag, pathParams);
        }

        data.tag = tag;
        data.params = deepExtend(pathParams, search, hash);
      } else {
        data.params = deepExtend(search, hash);
      }

      data.params = assignDefaultData(data.params, defaultData);
      return data;
    },

    out(meduxLocation) {
      let params = excludeDefault(meduxLocation.params, defaultData, true);
      let result;

      if (pathnameRules) {
        let {
          pathParams,
          tag
        } = matchCache.get(meduxLocation.tag) || {};

        if (!tag || !pathParams) {
          pathParams = {};
          tag = extractPathParams(pathnameRules, meduxLocation.tag, pathParams);
          matchCache.set(meduxLocation.tag, tag, pathParams);
        }

        params = excludeDefault(params, pathParams, false);
        result = splitPrivate(params, pathParams);
      } else {
        result = splitPrivate(params, {});
      }

      return toNativeLocation(meduxLocation.tag, result[0], result[1], key, base64, serialization.stringify);
    }

  };
}