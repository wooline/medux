import assignDeep from './deep-extend';
import {ruleToPathname} from './matchPath';
import type {Params, Location, NativeLocation} from './basic';

export type LocationTransform<P extends Params = Params> = {in: (nativeLocation: NativeLocation) => Location<P>; out: (meduxLocation: Location<P>) => NativeLocation};

export type LocationMap<P extends Params = Params> = {in: (meduxLocation: Location) => Location<P>; out: (nativeLocation: Location<P>) => Location};

function extractHashData(params: {[moduleName: string]: any}): {search?: {[moduleName: string]: any}; hash?: {[moduleName: string]: any}} {
  const moduleNames = Object.keys(params);
  if (moduleNames.length > 0) {
    const searchParams: {[moduleName: string]: any} = {};
    let hashParams: {[moduleName: string]: any} | undefined;
    moduleNames.forEach((moduleName) => {
      const data = params[moduleName];
      const keys = Object.keys(data);
      if (keys.length > 0) {
        if (`,${keys.join(',')}`.indexOf(',_') > -1) {
          keys.forEach((key) => {
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
      hash: hashParams,
    };
  }
  return {search: undefined, hash: undefined};
}

function splitSearch(search: string, key: string): string {
  const reg = new RegExp(`[?&#]${key}=([^&]+)`);
  const arr = search.match(reg);
  return arr ? arr[1] : '';
}

// 排除默认路由参数，路由中如果参数值与默认参数相同可省去
// 如果最终moduleParams为空{}，能不能省去：
function excludeDefaultData(data: {[moduleName: string]: any}, def: {[moduleName: string]: any}, filterEmpty?: boolean) {
  const result: any = {};
  Object.keys(data).forEach((moduleName) => {
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

function assignDefaultData(data: {[moduleName: string]: any}, def: {[moduleName: string]: any}): {[moduleName: string]: any} {
  return Object.keys(data).reduce((params, moduleName) => {
    params[moduleName] = def[moduleName] ? assignDeep({}, def[moduleName], data[moduleName]) : data[moduleName];
    return params;
  }, {});
}

function nativeLocationToMeduxLocation(nativeLocation: NativeLocation, defaultData: {[moduleName: string]: any}, key?: string): Location<any> {
  const search = key ? splitSearch(nativeLocation.search, key) : nativeLocation.search;
  const hash = key ? splitSearch(nativeLocation.hash, key) : nativeLocation.hash;
  const params = {...(search ? JSON.parse(search) : undefined), ...(hash ? JSON.parse(hash) : undefined)};
  const pathname = `/${nativeLocation.pathname}`.replace(/\/+/g, '/');
  return {tag: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname, params: assignDefaultData(params, defaultData)};
}

function meduxLocationToNativeLocation(meduxLocation: Location<any>, defaultData: {[moduleName: string]: any}, key?: string): NativeLocation {
  const {search, hash} = extractHashData(excludeDefaultData(meduxLocation.params, defaultData));
  const searchStr = search ? JSON.stringify(search) : '';
  const hashStr = hash ? JSON.stringify(hash) : '';
  const pathname = `/${meduxLocation.tag}`.replace(/\/+/g, '/');
  return {pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname, search: key ? `${key}=${searchStr}` : searchStr, hash: key ? `${key}=${hashStr}` : hashStr};
}

export function createLocationTransform<P extends Params>(defaultData: {[moduleName: string]: any} = {}, locationMap?: LocationMap<P>, key?: string): LocationTransform<P> {
  return {
    in(nativeLocation: NativeLocation): Location<P> {
      const data = nativeLocationToMeduxLocation(nativeLocation, defaultData, key);
      return locationMap ? locationMap.in(data) : data;
    },
    out(meduxLocation: Location<P>): NativeLocation {
      let data: Location = meduxLocation;
      if (locationMap) {
        const location = locationMap.out(meduxLocation);
        const {pathname, params} = ruleToPathname(location.tag, location.params);
        data = {tag: pathname, params};
      }
      return meduxLocationToNativeLocation(data, defaultData, key);
    },
  };
}
