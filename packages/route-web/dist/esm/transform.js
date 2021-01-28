import { deepMerge } from '@medux/core';
import { extendDefault, excludeDefault, splitPrivate } from './deep-extend';
import { routeConfig } from './basic';

function assignDefaultData(data, def) {
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

function splitSearch(search, paramsKey) {
  var reg = new RegExp("&" + paramsKey + "=([^&]+)");
  var arr = ("&" + search).match(reg);
  return arr ? arr[1] : '';
}

function encodeBas64(str) {
  return typeof btoa === 'function' ? btoa(str) : typeof Buffer === 'object' ? Buffer.from(str).toString('base64') : str;
}

function decodeBas64(str) {
  return typeof atob === 'function' ? atob(str) : typeof Buffer === 'object' ? Buffer.from(str, 'base64').toString() : str;
}

function parseNativeLocation(nativeLocation, paramsKey, base64, parse) {
  var search = splitSearch(nativeLocation.search, paramsKey);
  var hash = splitSearch(nativeLocation.hash, paramsKey);

  if (base64) {
    search = search && decodeBas64(search);
    hash = hash && decodeBas64(hash);
  }

  var pathname = nativeLocation.pathname;

  if (!pathname.startsWith('/')) {
    pathname = "/" + pathname;
  }

  return {
    pathname: pathname.replace(/\/*$/, '') || '/',
    searchParams: search ? parse(search) : undefined,
    hashParams: hash ? parse(hash) : undefined
  };
}

function toNativeLocation(pathname, search, hash, paramsKey, base64, stringify) {
  var searchStr = search ? stringify(search) : '';
  var hashStr = hash ? stringify(hash) : '';

  if (base64) {
    searchStr = searchStr && encodeBas64(searchStr);
    hashStr = hashStr && encodeBas64(hashStr);
  }

  if (!pathname.startsWith('/')) {
    pathname = "/" + pathname;
  }

  return {
    pathname: pathname.replace(/\/*$/, '') || '/',
    search: searchStr && paramsKey + "=" + searchStr,
    hash: hashStr && paramsKey + "=" + hashStr
  };
}

export function createPathnameTransform(pathnameIn, pagenameMap, pathnameOut) {
  pagenameMap = Object.keys(pagenameMap).sort(function (a, b) {
    return b.length - a.length;
  }).reduce(function (map, pagename) {
    var fullPagename = ("/" + pagename + "/").replace('//', '/').replace('//', '/');
    map[fullPagename] = pagenameMap[pagename];
    return map;
  }, {});
  routeConfig.pagenames = Object.keys(pagenameMap).reduce(function (obj, key) {
    obj[key] = key;
    return obj;
  }, {});
  return {
    in: function _in(pathname) {
      pathname = pathnameIn(pathname);

      if (!pathname.endsWith('/')) {
        pathname = pathname + "/";
      }

      var pagename = Object.keys(pagenameMap).find(function (name) {
        return pathname.startsWith(name);
      });
      var pathParams;

      if (!pagename) {
        pagename = pathname.replace(/\/*$/, '');
        pathParams = {};
      } else {
        var args = pathname.replace(pagename, '').split('/').map(function (item) {
          return item ? decodeURIComponent(item) : undefined;
        });
        pathParams = pagenameMap[pagename].in(args);
        pagename = pagename.replace(/\/$/, '');
      }

      return {
        pagename: pagename,
        pathParams: pathParams
      };
    },
    out: function out(pagename, params) {
      pagename = ("/" + pagename + "/").replace('//', '/').replace('//', '/');
      var pathname;

      if (!pagenameMap[pagename]) {
        pathname = pagename.replace(/\/$/, '');
      } else {
        var args = pagenameMap[pagename].out(params);
        pathname = pagename + args.map(function (item) {
          return item && encodeURIComponent(item);
        }).join('/').replace(/\/*$/, '');
      }

      if (pathnameOut) {
        pathname = pathnameOut(pathname);
      }

      var data = this.in(pathname);
      var pathParams = data.pathParams;
      return {
        pathname: pathname,
        pathParams: pathParams
      };
    }
  };
}
export function createLocationTransform(pathnameTransform, defaultData, base64, serialization, paramsKey) {
  if (base64 === void 0) {
    base64 = false;
  }

  if (serialization === void 0) {
    serialization = JSON;
  }

  if (paramsKey === void 0) {
    paramsKey = '_';
  }

  return {
    in: function _in(nativeLocation) {
      var _parseNativeLocation = parseNativeLocation(nativeLocation, paramsKey, base64, serialization.parse),
          pathname = _parseNativeLocation.pathname,
          searchParams = _parseNativeLocation.searchParams,
          hashParams = _parseNativeLocation.hashParams;

      var _pathnameTransform$in = pathnameTransform.in(pathname),
          pagename = _pathnameTransform$in.pagename,
          pathParams = _pathnameTransform$in.pathParams;

      var params = deepMerge(pathParams, searchParams, hashParams);
      params = assignDefaultData(params, defaultData);
      return {
        pagename: pagename,
        params: params
      };
    },
    out: function out(meduxLocation) {
      var params = excludeDefault(meduxLocation.params, defaultData, true);

      var _pathnameTransform$ou = pathnameTransform.out(meduxLocation.pagename, params),
          pathname = _pathnameTransform$ou.pathname,
          pathParams = _pathnameTransform$ou.pathParams;

      params = excludeDefault(params, pathParams, false);
      var result = splitPrivate(params, pathParams);
      return toNativeLocation(pathname, result[0], result[1], paramsKey, base64, serialization.stringify);
    }
  };
}