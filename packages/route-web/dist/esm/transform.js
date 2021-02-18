import { deepMerge } from '@medux/core';
import { extendDefault, excludeDefault, splitPrivate } from './deep-extend';
import { routeConfig } from './basic';
export function assignDefaultData(data) {
  var def = routeConfig.defaultParams;
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

function dataIsNativeLocation(data) {
  return data['pathname'];
}

export function createLocationTransform(defaultParams, pagenameMap, nativeLocationMap, notfoundPagename, paramsKey) {
  if (notfoundPagename === void 0) {
    notfoundPagename = '/404';
  }

  if (paramsKey === void 0) {
    paramsKey = '_';
  }

  routeConfig.defaultParams = defaultParams;
  var pagenames = Object.keys(pagenameMap);
  pagenameMap = pagenames.sort(function (a, b) {
    return b.length - a.length;
  }).reduce(function (map, pagename) {
    var fullPagename = ("/" + pagename + "/").replace(/^\/+|\/+$/g, '/');
    map[fullPagename] = pagenameMap[pagename];
    return map;
  }, {});
  routeConfig.pagenames = pagenames.reduce(function (obj, key) {
    obj[key] = key;
    return obj;
  }, {});
  pagenames = Object.keys(pagenameMap);

  function toStringArgs(arr) {
    return arr.map(function (item) {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  }

  return {
    in: function _in(data) {
      var path;

      if (dataIsNativeLocation(data)) {
        data = nativeLocationMap.in(data);
        path = data.pathname;
      } else {
        path = data.pagename;
      }

      path = ("/" + path + "/").replace(/^\/+|\/+$/g, '/');
      var pagename = pagenames.find(function (name) {
        return path.startsWith(name);
      });
      var params;

      if (pagename) {
        if (dataIsNativeLocation(data)) {
          var searchParams = data.searchData && data.searchData[paramsKey] ? JSON.parse(data.searchData[paramsKey]) : undefined;
          var hashParams = data.hashData && data.hashData[paramsKey] ? JSON.parse(data.hashData[paramsKey]) : undefined;

          var _pathArgs = path.replace(pagename, '').split('/').map(function (item) {
            return item ? decodeURIComponent(item) : undefined;
          });

          var pathParams = pagenameMap[pagename].argsToParams(_pathArgs);
          params = deepMerge(pathParams, searchParams, hashParams);
        } else {
          var _pathParams = pagenameMap[pagename].argsToParams([]);

          params = deepMerge(_pathParams, data.params);
        }
      } else {
        pagename = notfoundPagename + "/";
        params = pagenameMap[pagename] ? pagenameMap[pagename].argsToParams([path.replace(/\/$/, '')]) : {};
      }

      return {
        pagename: "/" + pagename.replace(/^\/+|\/+$/g, ''),
        params: assignDefaultData(params)
      };
    },
    out: function out(meduxLocation) {
      var _ref, _ref2;

      var params = excludeDefault(meduxLocation.params, defaultParams, true);
      var pagename = ("/" + meduxLocation.pagename + "/").replace(/^\/+|\/+$/g, '/');
      var pathParams;
      var pathname;

      if (pagenameMap[pagename]) {
        var _pathArgs2 = toStringArgs(pagenameMap[pagename].paramsToArgs(params));

        pathParams = pagenameMap[pagename].argsToParams(_pathArgs2);
        pathname = pagename + _pathArgs2.map(function (item) {
          return item && encodeURIComponent(item);
        }).join('/').replace(/\/*$/, '');
      } else {
        pathParams = {};
        pathname = pagename;
      }

      params = excludeDefault(params, pathParams, false);
      var result = splitPrivate(params, pathParams);
      var nativeLocation = {
        pathname: "/" + pathname.replace(/^\/+|\/+$/g, ''),
        searchData: result[0] ? (_ref = {}, _ref[paramsKey] = JSON.stringify(result[0]), _ref) : undefined,
        hashData: result[1] ? (_ref2 = {}, _ref2[paramsKey] = JSON.stringify(result[1]), _ref2) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    }
  };
}