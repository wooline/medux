import {deepMerge} from '@medux/core';
import {extendDefault, excludeDefault, splitPrivate} from './deep-extend';
import {extractPathParams, PathnameRules} from './matchPath';
import type {RootParams, Location, NativeLocation} from './basic';

export type LocationTransform<P extends RootParams, NL extends NativeLocation = NativeLocation> = {in: (nativeLocation: NL) => Location<P>; out: (meduxLocation: Location<P>) => NL};

export type LocationMap<P extends RootParams> = {in: (location: Location<any>) => Location<P>; out: (location: Location<P>) => Location<any>};

function splitSearch(search: string, key: string): string {
  const reg = new RegExp(`&${key}=([^&]+)`);
  const arr = `&${search}`.match(reg);
  return arr ? arr[1] : '';
}

function assignDefaultData(data: {[moduleName: string]: any}, def: {[moduleName: string]: any}): {[moduleName: string]: any} {
  return Object.keys(data).reduce((params, moduleName) => {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }
    return params;
  }, {});
}

function encodeBas64(str: string): string {
  // @ts-ignore
  // eslint-disable-next-line no-nested-ternary
  return typeof btoa === 'function' ? btoa(str) : typeof Buffer === 'object' ? Buffer.from(str).toString('base64') : str;
}
function decodeBas64(str: string): string {
  // @ts-ignore
  // eslint-disable-next-line no-nested-ternary
  return typeof atob === 'function' ? atob(str) : typeof Buffer === 'object' ? Buffer.from(str, 'base64').toString() : str;
}
function parseWebNativeLocation(nativeLocation: NativeLocation, key: string, base64: boolean, parse: (str: string) => any): {pathname: string; search: any; hash: any} {
  let search = splitSearch(nativeLocation.search, key);
  let hash = splitSearch(nativeLocation.hash, key);
  if (base64) {
    search = search ? decodeBas64(search) : '';
    hash = hash ? decodeBas64(hash) : '';
  }
  const pathname = `/${nativeLocation.pathname}`.replace(/\/+/g, '/');
  return {pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname, search: search ? parse(search) : undefined, hash: hash ? parse(hash) : undefined};
}

function toNativeLocation(tag: string, search: any, hash: any, key: string, base64: boolean, stringify: (data: any) => string): NativeLocation {
  let searchStr = search ? stringify(search) : '';
  let hashStr = hash ? stringify(hash) : '';
  if (base64) {
    searchStr = searchStr ? encodeBas64(searchStr) : '';
    hashStr = hashStr ? encodeBas64(hashStr) : '';
  }
  const pathname = `/${tag}`.replace(/\/+/g, '/');
  return {pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname, search: searchStr ? `${key}=${searchStr}` : '', hash: hashStr ? `${key}=${hashStr}` : ''};
}

export function isLocationMap<P extends RootParams>(data: LocationMap<P> | PathnameRules<P>): data is LocationMap<P> {
  if (typeof data.in === 'function' && typeof data.out === 'function') {
    return true;
  }
  return false;
}

export function createWebLocationTransform<P extends RootParams>(
  defaultData: P,
  pathnameRules?: PathnameRules<P>,
  base64: boolean = false,
  serialization: {parse(str: string): any; stringify(data: any): string} = JSON,
  key: string = '_'
): LocationTransform<P, NativeLocation> {
  // 主要用来cache 以下out会使用到in中的PathnameRules
  const matchCache = {
    _cache: {},
    get(pathname: string): {pathParams: {}; tag: string} | undefined {
      if (this._cache[pathname]) {
        const {tag, pathParams}: {tag: string; pathParams: string} = this._cache[pathname];
        return {tag, pathParams: JSON.parse(pathParams)};
      }
      return undefined;
    },
    set(pathname: string, tag: string, pathParams: {}) {
      const keys = Object.keys(this._cache);
      if (keys.length > 100) {
        delete this._cache[keys[0]];
      }
      this._cache[pathname] = {tag, pathParams: JSON.stringify(pathParams)};
    },
  };
  return {
    in(nativeLocation: NativeLocation): Location<P> {
      const {pathname, search, hash} = parseWebNativeLocation(nativeLocation, key, base64, serialization.parse);
      const data: Location<any> = {tag: pathname, params: {}};
      if (pathnameRules) {
        let {pathParams, tag} = matchCache.get(pathname) || {};
        if (!tag || !pathParams) {
          pathParams = {};
          tag = extractPathParams(pathnameRules, pathname, pathParams);
          matchCache.set(pathname, tag, pathParams);
        }
        data.tag = tag;
        data.params = deepMerge(pathParams, search, hash);
      } else {
        data.params = deepMerge(search, hash);
      }
      data.params = assignDefaultData(data.params, defaultData);
      return data;
    },
    out(meduxLocation: Location<P>): NativeLocation {
      let params = excludeDefault(meduxLocation.params, defaultData, true);
      let result;
      if (pathnameRules) {
        let {pathParams, tag} = matchCache.get(meduxLocation.tag) || {};
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
    },
  };
}
