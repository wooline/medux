"use strict";

exports.__esModule = true;
exports.assignDefaultData = assignDefaultData;
exports.createLocationTransform = createLocationTransform;

var _core = require("@medux/core");

var _deepExtend = require("./deep-extend");

var _basic = require("./basic");

function assignDefaultData(data) {
  var def = _basic.routeConfig.defaultParams;
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = (0, _deepExtend.extendDefault)(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

function splitSearch(search, paramsKey) {
  var reg = new RegExp("&" + paramsKey + "=([^&]+)");
  var arr = ("&" + search).match(reg);
  return arr ? arr[1] : '';
}

function parseNativeLocation(nativeLocation, paramsKey, base64, parse) {
  var search = splitSearch(nativeLocation.search, paramsKey);
  var hash = splitSearch(nativeLocation.hash, paramsKey);

  if (base64) {
    search = _core.env.decodeBas64(search);
    hash = _core.env.decodeBas64(hash);
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
  var searchStr = search ? stringify(search) : '';
  var hashStr = hash ? stringify(hash) : '';

  if (base64) {
    searchStr = _core.env.encodeBas64(searchStr);
    hashStr = _core.env.encodeBas64(hashStr);
  } else {
    searchStr = searchStr && encodeURIComponent(searchStr);
    hashStr = hashStr && encodeURIComponent(hashStr);
  }

  return {
    pathname: "/" + pathname.replace(/^\/+|\/+$/g, ''),
    search: searchStr && paramsKey + "=" + searchStr,
    hash: hashStr && paramsKey + "=" + hashStr
  };
}

function dataIsNativeLocation(data) {
  return data['pathname'];
}

function createLocationTransform(defaultParams, pagenameMap, nativeLocationMap, notfoundPagename, base64, serialization, paramsKey) {
  if (notfoundPagename === void 0) {
    notfoundPagename = '/404';
  }

  if (base64 === void 0) {
    base64 = false;
  }

  if (serialization === void 0) {
    serialization = JSON;
  }

  if (paramsKey === void 0) {
    paramsKey = '_';
  }

  _basic.routeConfig.defaultParams = defaultParams;
  var pagenames = Object.keys(pagenameMap);
  pagenameMap = pagenames.sort(function (a, b) {
    return b.length - a.length;
  }).reduce(function (map, pagename) {
    var fullPagename = ("/" + pagename + "/").replace(/^\/+|\/+$/g, '/');
    map[fullPagename] = pagenameMap[pagename];
    return map;
  }, {});
  _basic.routeConfig.pagenames = pagenames.reduce(function (obj, key) {
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
          var _parseNativeLocation = parseNativeLocation(data, paramsKey, base64, serialization.parse),
              searchParams = _parseNativeLocation.searchParams,
              hashParams = _parseNativeLocation.hashParams;

          var _pathArgs = path.replace(pagename, '').split('/').map(function (item) {
            return item ? decodeURIComponent(item) : undefined;
          });

          var pathParams = pagenameMap[pagename].argsToParams(_pathArgs);
          params = (0, _core.deepMerge)(pathParams, searchParams, hashParams);
        } else {
          var _pathParams = pagenameMap[pagename].argsToParams([]);

          params = (0, _core.deepMerge)(_pathParams, data.params);
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
      var params = (0, _deepExtend.excludeDefault)(meduxLocation.params, defaultParams, true);
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

      params = (0, _deepExtend.excludeDefault)(params, pathParams, false);
      var result = (0, _deepExtend.splitPrivate)(params, pathParams);
      var nativeLocation = toNativeLocation(pathname, result[0], result[1], paramsKey, base64, serialization.stringify);
      return nativeLocationMap.out(nativeLocation);
    }
  };
}