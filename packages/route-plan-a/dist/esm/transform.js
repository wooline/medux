import { deepExtend } from './deep-extend';
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
    params[moduleName] = def[moduleName] ? deepExtend({}, def[moduleName], data[moduleName]) : data[moduleName];
    return params;
  }, {});
}

function nativeLocationToMeduxLocation(nativeLocation, defaultData, key, parse) {
  var search = key ? splitSearch(nativeLocation.search, key) : nativeLocation.search;
  var hash = key ? splitSearch(nativeLocation.hash, key) : nativeLocation.hash;
  var params = deepExtend(search ? parse(search) : {}, hash ? parse(hash) : undefined);
  var pathname = ("/" + nativeLocation.pathname).replace(/\/+/g, '/');
  return {
    tag: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
    params: assignDefaultData(params, defaultData)
  };
}

function meduxLocationToNativeLocation(meduxLocation, defaultData, key, stringify) {
  var _extractHashData = extractHashData(excludeDefaultData(meduxLocation.params, defaultData)),
      search = _extractHashData.search,
      hash = _extractHashData.hash;

  var searchStr = search ? stringify(search) : '';
  var hashStr = hash ? stringify(hash) : '';
  var pathname = ("/" + meduxLocation.tag).replace(/\/+/g, '/');
  return {
    pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
    search: key ? key + "=" + searchStr : searchStr,
    hash: key ? key + "=" + hashStr : hashStr
  };
}

var inCache = {};
export function createWebLocationTransform(defaultData, locationMap, serialization, key) {
  if (serialization === void 0) {
    serialization = JSON;
  }

  if (key === void 0) {
    key = '';
  }

  return {
    in: function _in(nativeLocation) {
      var pathname = nativeLocation.pathname,
          search = nativeLocation.search,
          hash = nativeLocation.hash;
      var url = pathname + "?" + search + "#" + hash;

      if (inCache[url]) {
        return inCache[url];
      }

      var data = nativeLocationToMeduxLocation(nativeLocation, defaultData || {}, key, serialization.parse);
      var location = locationMap ? locationMap.in(data) : data;
      var urls = Object.keys(inCache);

      if (urls.length > 1000) {
        delete inCache[urls[0]];
      }

      inCache[url] = location;
      return location;
    },
    out: function out(meduxLocation) {
      var data = meduxLocation;

      if (locationMap) {
        var _location = locationMap.out(meduxLocation);

        var _ruleToPathname = ruleToPathname(_location.tag, _location.params),
            pathname = _ruleToPathname.pathname,
            params = _ruleToPathname.params;

        data = {
          tag: pathname,
          params: params
        };
      }

      return meduxLocationToNativeLocation(data, defaultData || {}, key, serialization.stringify);
    }
  };
}