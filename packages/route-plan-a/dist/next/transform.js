import { deepExtend } from './deep-extend';
import { ruleToPathname } from './matchPath';

function extractHashData(params) {
  const moduleNames = Object.keys(params);

  if (moduleNames.length > 0) {
    const searchParams = {};
    let hashParams;
    moduleNames.forEach(moduleName => {
      const data = params[moduleName];
      const keys = Object.keys(data);

      if (keys.length > 0) {
        if (`,${keys.join(',')}`.indexOf(',_') > -1) {
          keys.forEach(key => {
            if (key.startsWith('_')) {
              if (!hashParams) {
                hashParams = {};
              }

              if (!hashParams[moduleName]) {
                hashParams[moduleName] = {};
              }

              hashParams[moduleName][key] = data[key];
            } else {
              if (!searchParams[moduleName]) {
                searchParams[moduleName] = {};
              }

              searchParams[moduleName][key] = data[key];
            }
          });
        } else {
          searchParams[moduleName] = data;
        }
      } else {
        searchParams[moduleName] = {};
      }
    });
    return {
      search: searchParams,
      hash: hashParams
    };
  }

  return {
    search: undefined,
    hash: undefined
  };
}

function splitSearch(search, key) {
  const reg = new RegExp(`[?&#]${key}=([^&]+)`);
  const arr = search.match(reg);
  return arr ? arr[1] : '';
}

function excludeDefaultData(data, def, filterEmpty) {
  const result = {};
  Object.keys(data).forEach(moduleName => {
    let value = data[moduleName];
    const defaultValue = def[moduleName];

    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && typeof value === 'object' && !Array.isArray(value)) {
        value = excludeDefaultData(value, defaultValue, true);
      }

      if (value !== undefined) {
        result[moduleName] = value;
      }
    }
  });

  if (Object.keys(result).length === 0 && filterEmpty) {
    return undefined;
  }

  return result;
}

function assignDefaultData(data, def) {
  return Object.keys(data).reduce((params, moduleName) => {
    params[moduleName] = def[moduleName] ? deepExtend({}, def[moduleName], data[moduleName]) : data[moduleName];
    return params;
  }, {});
}

function nativeLocationToMeduxLocation(nativeLocation, defaultData, key, parse) {
  const search = key ? splitSearch(nativeLocation.search, key) : nativeLocation.search;
  const hash = key ? splitSearch(nativeLocation.hash, key) : nativeLocation.hash;
  const params = deepExtend(search ? parse(search) : {}, hash ? parse(hash) : undefined);
  const pathname = `/${nativeLocation.pathname}`.replace(/\/+/g, '/');
  return {
    tag: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
    params: assignDefaultData(params, defaultData)
  };
}

function meduxLocationToNativeLocation(meduxLocation, defaultData, key, stringify) {
  const {
    search,
    hash
  } = extractHashData(excludeDefaultData(meduxLocation.params, defaultData));
  const searchStr = search ? stringify(search) : '';
  const hashStr = hash ? stringify(hash) : '';
  const pathname = `/${meduxLocation.tag}`.replace(/\/+/g, '/');
  return {
    pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
    search: key ? `${key}=${searchStr}` : searchStr,
    hash: key ? `${key}=${hashStr}` : hashStr
  };
}

const inCache = {};
export function createWebLocationTransform(defaultData, locationMap, serialization = JSON, key = '') {
  return {
    in(nativeLocation) {
      const {
        pathname,
        search,
        hash
      } = nativeLocation;
      const url = `${pathname}?${search}#${hash}`;

      if (inCache[url]) {
        return inCache[url];
      }

      const data = nativeLocationToMeduxLocation(nativeLocation, defaultData || {}, key, serialization.parse);
      const location = locationMap ? locationMap.in(data) : data;
      const urls = Object.keys(inCache);

      if (urls.length > 1000) {
        delete inCache[urls[0]];
      }

      inCache[url] = location;
      return location;
    },

    out(meduxLocation) {
      let data = meduxLocation;

      if (locationMap) {
        const location = locationMap.out(meduxLocation);
        const {
          pathname,
          params
        } = ruleToPathname(location.tag, location.params);
        data = {
          tag: pathname,
          params
        };
      }

      return meduxLocationToNativeLocation(data, defaultData || {}, key, serialization.stringify);
    }

  };
}