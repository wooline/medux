import { deepMerge, env } from '@medux/core';
import { extendDefault, excludeDefault, splitPrivate } from './deep-extend';
import { routeConfig } from './basic';
export function assignDefaultData(data) {
  const def = routeConfig.defaultParams;
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

function parseNativeLocation(nativeLocation, paramsKey, base64, parse) {
  let search = splitSearch(nativeLocation.search, paramsKey);
  let hash = splitSearch(nativeLocation.hash, paramsKey);

  if (base64) {
    search = env.decodeBas64(search);
    hash = env.decodeBas64(hash);
  } else {
    search = search && decodeURIComponent(search);
    hash = hash && decodeURIComponent(hash);
  }

  return {
    searchParams: search ? parse(search) : undefined,
    hashParams: hash ? parse(hash) : undefined
  };
}

function toNativeLocation(pathname, search, hash, paramsKey, base64, stringify) {
  let searchStr = search ? stringify(search) : '';
  let hashStr = hash ? stringify(hash) : '';

  if (base64) {
    searchStr = env.encodeBas64(searchStr);
    hashStr = env.encodeBas64(hashStr);
  } else {
    searchStr = searchStr && encodeURIComponent(searchStr);
    hashStr = hashStr && encodeURIComponent(hashStr);
  }

  return {
    pathname: `/${pathname.replace(/^\/+|\/+$/g, '')}`,
    search: searchStr && `${paramsKey}=${searchStr}`,
    hash: hashStr && `${paramsKey}=${hashStr}`
  };
}

function dataIsNativeLocation(data) {
  return data['pathname'];
}

export function createLocationTransform(defaultParams, pagenameMap, nativeLocationMap, notfoundPagename = '/404', base64 = false, serialization = JSON, paramsKey = '_') {
  routeConfig.defaultParams = defaultParams;
  let pagenames = Object.keys(pagenameMap);
  pagenameMap = pagenames.sort((a, b) => b.length - a.length).reduce((map, pagename) => {
    const fullPagename = `/${pagename}/`.replace(/^\/+|\/+$/g, '/');
    map[fullPagename] = pagenameMap[pagename];
    return map;
  }, {});
  routeConfig.pagenames = pagenames.reduce((obj, key) => {
    obj[key] = key;
    return obj;
  }, {});
  pagenames = Object.keys(pagenameMap);

  function toStringArgs(arr) {
    return arr.map(item => {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  }

  return {
    in(data) {
      let path;

      if (dataIsNativeLocation(data)) {
        data = nativeLocationMap.in(data);
        path = data.pathname;
      } else {
        path = data.pagename;
      }

      path = `/${path}/`.replace(/^\/+|\/+$/g, '/');
      let pagename = pagenames.find(name => path.startsWith(name));
      let params;

      if (pagename) {
        if (dataIsNativeLocation(data)) {
          const {
            searchParams,
            hashParams
          } = parseNativeLocation(data, paramsKey, base64, serialization.parse);
          const pathArgs = path.replace(pagename, '').split('/').map(item => item ? decodeURIComponent(item) : undefined);
          const pathParams = pagenameMap[pagename].argsToParams(pathArgs);
          params = deepMerge(pathParams, searchParams, hashParams);
        } else {
          const pathParams = pagenameMap[pagename].argsToParams([]);
          params = deepMerge(pathParams, data.params);
        }
      } else {
        pagename = `${notfoundPagename}/`;
        params = pagenameMap[pagename] ? pagenameMap[pagename].argsToParams([path.replace(/\/$/, '')]) : {};
      }

      return {
        pagename: `/${pagename.replace(/^\/+|\/+$/g, '')}`,
        params: assignDefaultData(params)
      };
    },

    out(meduxLocation) {
      let params = excludeDefault(meduxLocation.params, defaultParams, true);
      const pagename = `/${meduxLocation.pagename}/`.replace(/^\/+|\/+$/g, '/');
      let pathParams;
      let pathname;

      if (pagenameMap[pagename]) {
        const pathArgs = toStringArgs(pagenameMap[pagename].paramsToArgs(params));
        pathParams = pagenameMap[pagename].argsToParams(pathArgs);
        pathname = pagename + pathArgs.map(item => item && encodeURIComponent(item)).join('/').replace(/\/*$/, '');
      } else {
        pathParams = {};
        pathname = pagename;
      }

      params = excludeDefault(params, pathParams, false);
      const result = splitPrivate(params, pathParams);
      const nativeLocation = toNativeLocation(pathname, result[0], result[1], paramsKey, base64, serialization.stringify);
      return nativeLocationMap.out(nativeLocation);
    }

  };
}