import assignDeep from './deep-extend';
import { ruleToPathname } from './matchPath';

function extractHashData(params) {
  var moduleNames = Object.keys(params);

  if (moduleNames.length > 0) {
    var searchParams = {};
    var hashParams;
    moduleNames.forEach(function (moduleName) {
      var data = params[moduleName];
      var keys = Object.keys(data);

      if (keys.length > 0) {
        if (("," + keys.join(',')).indexOf(',_') > -1) {
          keys.forEach(function (key) {
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
  var reg = new RegExp("[?&#]" + key + "=([^&]+)");
  var arr = search.match(reg);
  return arr ? arr[1] : '';
}

function excludeDefaultData(data, def, filterEmpty) {
  var result = {};
  Object.keys(data).forEach(function (moduleName) {
    var value = data[moduleName];
    var defaultValue = def[moduleName];

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
  return Object.keys(data).reduce(function (params, moduleName) {
    params[moduleName] = def[moduleName] ? assignDeep({}, def[moduleName], data[moduleName]) : data[moduleName];
    return params;
  }, {});
}

function nativeLocationToMeduxLocation(nativeLocation, defaultData, key) {
  var search = key ? splitSearch(nativeLocation.search, key) : nativeLocation.search;
  var hash = key ? splitSearch(nativeLocation.hash, key) : nativeLocation.hash;
  var params = Object.assign({}, search ? JSON.parse(search) : undefined, hash ? JSON.parse(hash) : undefined);
  var pathname = ("/" + nativeLocation.pathname).replace(/\/+/g, '/');
  return {
    tag: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
    params: assignDefaultData(params, defaultData)
  };
}

function meduxLocationToNativeLocation(meduxLocation, defaultData, key) {
  var _extractHashData = extractHashData(excludeDefaultData(meduxLocation.params, defaultData)),
      search = _extractHashData.search,
      hash = _extractHashData.hash;

  var searchStr = search ? JSON.stringify(search) : '';
  var hashStr = hash ? JSON.stringify(hash) : '';
  var pathname = ("/" + meduxLocation.tag).replace(/\/+/g, '/');
  return {
    pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
    search: key ? key + "=" + searchStr : searchStr,
    hash: key ? key + "=" + hashStr : hashStr
  };
}

export function createLocationTransform(defaultData, locationMap, key) {
  if (defaultData === void 0) {
    defaultData = {};
  }

  return {
    in: function _in(nativeLocation) {
      var data = nativeLocationToMeduxLocation(nativeLocation, defaultData, key);
      return locationMap ? locationMap.in(data) : data;
    },
    out: function out(meduxLocation) {
      var data = meduxLocation;

      if (locationMap) {
        var location = locationMap.out(meduxLocation);

        var _ruleToPathname = ruleToPathname(location.tag, location.params),
            pathname = _ruleToPathname.pathname,
            params = _ruleToPathname.params;

        data = {
          tag: pathname,
          params: params
        };
      }

      return meduxLocationToNativeLocation(data, defaultData, key);
    }
  };
}