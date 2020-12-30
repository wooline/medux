"use strict";

exports.__esModule = true;
exports.isLocationMap = isLocationMap;
exports.createWebLocationTransform = createWebLocationTransform;

var _core = require("@medux/core");

var _deepExtend = require("./deep-extend");

var _matchPath = require("./matchPath");

function splitSearch(search, key) {
  var reg = new RegExp("[?&#]" + key + "=([^&]+)");
  var arr = search.match(reg);
  return arr ? arr[1] : '';
}

function assignDefaultData(data, def) {
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = (0, _deepExtend.extendDefault)(data[moduleName], def[moduleName]);
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
  var search = key ? splitSearch(nativeLocation.search, key) : nativeLocation.search;
  var hash = key ? splitSearch(nativeLocation.hash, key) : nativeLocation.hash;

  if (base64) {
    search = search && decodeBas64(search);
    hash = hash && decodeBas64(hash);
  }

  var pathname = ("/" + nativeLocation.pathname).replace(/\/+/g, '/');
  return {
    pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
    search: search ? parse(search) : undefined,
    hash: hash ? parse(hash) : undefined
  };
}

function toNativeLocation(tag, search, hash, key, base64, stringify) {
  var searchStr = search ? stringify(search) : '';
  var hashStr = hash ? stringify(hash) : '';

  if (base64) {
    searchStr = searchStr && encodeBas64(searchStr);
    hashStr = hashStr && encodeBas64(hashStr);
  }

  var pathname = ("/" + tag).replace(/\/+/g, '/');
  return {
    pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname,
    search: key ? key + "=" + searchStr : searchStr,
    hash: key ? key + "=" + hashStr : hashStr
  };
}

function isLocationMap(data) {
  if (typeof data.in === 'function' && typeof data.out === 'function') {
    return true;
  }

  return false;
}

function createWebLocationTransform(defaultData, pathnameRules, base64, serialization, key) {
  if (base64 === void 0) {
    base64 = false;
  }

  if (serialization === void 0) {
    serialization = JSON;
  }

  if (key === void 0) {
    key = '';
  }

  var matchCache = {
    _cache: {},
    get: function get(pathname) {
      if (this._cache[pathname]) {
        var _this$_cache$pathname = this._cache[pathname],
            tag = _this$_cache$pathname.tag,
            pathParams = _this$_cache$pathname.pathParams;
        return {
          tag: tag,
          pathParams: JSON.parse(pathParams)
        };
      }

      return undefined;
    },
    set: function set(pathname, tag, pathParams) {
      var keys = Object.keys(this._cache);

      if (keys.length > 100) {
        delete this._cache[keys[0]];
      }

      this._cache[pathname] = {
        tag: tag,
        pathParams: JSON.stringify(pathParams)
      };
    }
  };
  return {
    in: function _in(nativeLocation) {
      var _parseWebNativeLocati = parseWebNativeLocation(nativeLocation, key, base64, serialization.parse),
          pathname = _parseWebNativeLocati.pathname,
          search = _parseWebNativeLocati.search,
          hash = _parseWebNativeLocati.hash;

      var data = {
        tag: pathname,
        params: {}
      };

      if (pathnameRules) {
        var _ref = matchCache.get(pathname) || {},
            pathParams = _ref.pathParams,
            tag = _ref.tag;

        if (!tag || !pathParams) {
          pathParams = {};
          tag = (0, _matchPath.extractPathParams)(pathnameRules, pathname, pathParams);
          matchCache.set(pathname, tag, pathParams);
        }

        data.tag = tag;
        data.params = (0, _core.deepMerge)(pathParams, search, hash);
      } else {
        data.params = (0, _core.deepMerge)(search, hash);
      }

      data.params = assignDefaultData(data.params, defaultData);
      return data;
    },
    out: function out(meduxLocation) {
      var params = (0, _deepExtend.excludeDefault)(meduxLocation.params, defaultData, true);
      var result;

      if (pathnameRules) {
        var _ref2 = matchCache.get(meduxLocation.tag) || {},
            pathParams = _ref2.pathParams,
            tag = _ref2.tag;

        if (!tag || !pathParams) {
          pathParams = {};
          tag = (0, _matchPath.extractPathParams)(pathnameRules, meduxLocation.tag, pathParams);
          matchCache.set(meduxLocation.tag, tag, pathParams);
        }

        params = (0, _deepExtend.excludeDefault)(params, pathParams, false);
        result = (0, _deepExtend.splitPrivate)(params, pathParams);
      } else {
        result = (0, _deepExtend.splitPrivate)(params, {});
      }

      return toNativeLocation(meduxLocation.tag, result[0], result[1], key, base64, serialization.stringify);
    }
  };
}