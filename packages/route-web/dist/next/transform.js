import { deepMerge } from '@medux/core';
import { extendDefault, excludeDefault, splitPrivate } from './deep-extend';
import { routeConfig } from './basic';

function assignDefaultData(data, def) {
  return Object.keys(data).reduce((params, moduleName) => {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

function splitSearch(search, paramsKey) {
  const reg = new RegExp(`&${paramsKey}=([^&]+)`);
  const arr = `&${search}`.match(reg);
  return arr ? arr[1] : '';
}

function encodeBas64(str) {
  return typeof btoa === 'function' ? btoa(str) : typeof Buffer === 'object' ? Buffer.from(str).toString('base64') : str;
}

function decodeBas64(str) {
  return typeof atob === 'function' ? atob(str) : typeof Buffer === 'object' ? Buffer.from(str, 'base64').toString() : str;
}

function parseNativeLocation(nativeLocation, paramsKey, base64, parse) {
  let search = splitSearch(nativeLocation.search, paramsKey);
  let hash = splitSearch(nativeLocation.hash, paramsKey);

  if (base64) {
    search = search && decodeBas64(search);
    hash = hash && decodeBas64(hash);
  }

  let pathname = nativeLocation.pathname;

  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  return {
    pathname: pathname.replace(/\/*$/, '') || '/',
    searchParams: search ? parse(search) : undefined,
    hashParams: hash ? parse(hash) : undefined
  };
}

function toNativeLocation(pathname, search, hash, paramsKey, base64, stringify) {
  let searchStr = search ? stringify(search) : '';
  let hashStr = hash ? stringify(hash) : '';

  if (base64) {
    searchStr = searchStr && encodeBas64(searchStr);
    hashStr = hashStr && encodeBas64(hashStr);
  }

  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  return {
    pathname: pathname.replace(/\/*$/, '') || '/',
    search: searchStr && `${paramsKey}=${searchStr}`,
    hash: hashStr && `${paramsKey}=${hashStr}`
  };
}

export function createPathnameTransform(pathnameIn, pagenameMap, pathnameOut) {
  pagenameMap = Object.keys(pagenameMap).sort((a, b) => b.length - a.length).reduce((map, pagename) => {
    const fullPagename = `/${pagename}/`.replace('//', '/').replace('//', '/');
    map[fullPagename] = pagenameMap[pagename];
    return map;
  }, {});
  routeConfig.pagenames = Object.keys(pagenameMap).reduce((obj, key) => {
    obj[key] = key;
    return obj;
  }, {});
  return {
    in(pathname) {
      pathname = pathnameIn(pathname);

      if (!pathname.endsWith('/')) {
        pathname = `${pathname}/`;
      }

      let pagename = Object.keys(pagenameMap).find(name => pathname.startsWith(name));
      let pathParams;

      if (!pagename) {
        pagename = pathname.replace(/\/*$/, '');
        pathParams = {};
      } else {
        const args = pathname.replace(pagename, '').split('/').map(item => item ? decodeURIComponent(item) : undefined);
        pathParams = pagenameMap[pagename].in(args);
        pagename = pagename.replace(/\/$/, '');
      }

      return {
        pagename,
        pathParams
      };
    },

    out(pagename, params) {
      pagename = `/${pagename}/`.replace('//', '/').replace('//', '/');
      let pathname;

      if (!pagenameMap[pagename]) {
        pathname = pagename.replace(/\/$/, '');
      } else {
        const args = pagenameMap[pagename].out(params);
        pathname = pagename + args.map(item => item && encodeURIComponent(item)).join('/').replace(/\/*$/, '');
      }

      if (pathnameOut) {
        pathname = pathnameOut(pathname);
      }

      const data = this.in(pathname);
      const pathParams = data.pathParams;
      return {
        pathname,
        pathParams
      };
    }

  };
}
export function createLocationTransform(pathnameTransform, defaultData, base64 = false, serialization = JSON, paramsKey = '_') {
  return {
    in(nativeLocation) {
      const {
        pathname,
        searchParams,
        hashParams
      } = parseNativeLocation(nativeLocation, paramsKey, base64, serialization.parse);
      const {
        pagename,
        pathParams
      } = pathnameTransform.in(pathname);
      let params = deepMerge(pathParams, searchParams, hashParams);
      params = assignDefaultData(params, defaultData);
      return {
        pagename,
        params
      };
    },

    out(meduxLocation) {
      let params = excludeDefault(meduxLocation.params, defaultData, true);
      const {
        pathname,
        pathParams
      } = pathnameTransform.out(meduxLocation.pagename, params);
      params = excludeDefault(params, pathParams, false);
      const result = splitPrivate(params, pathParams);
      return toNativeLocation(pathname, result[0], result[1], paramsKey, base64, serialization.stringify);
    }

  };
}