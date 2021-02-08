import {deepMerge, env} from '@medux/core';
import {extendDefault, excludeDefault, splitPrivate} from './deep-extend';
import {Location, NativeLocation, DeepPartial, RootParams, routeConfig, PartialLocation} from './basic';

export type LocationTransform<P extends RootParams> = {in: (nativeLocation: NativeLocation | PartialLocation<P>) => Location<P>; out: (meduxLocation: PartialLocation<P>) => NativeLocation};

export type PagenameMap<P extends RootParams> = {
  [pagename: string]: {
    argsToParams(pathArgs: Array<string | undefined>): DeepPartial<P>;
    paramsToArgs(params: DeepPartial<P>): Array<any>;
  };
};
export type NativeLocationMap = {
  in(nativeLocation: NativeLocation): NativeLocation;
  out(nativeLocation: NativeLocation): NativeLocation;
};
export function assignDefaultData(data: {[moduleName: string]: any}): {[moduleName: string]: any} {
  const def = routeConfig.defaultParams;
  return Object.keys(data).reduce((params, moduleName) => {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }
    return params;
  }, {});
}

function splitSearch(search: string, paramsKey: string): string {
  const reg = new RegExp(`&${paramsKey}=([^&]+)`);
  const arr = `&${search}`.match(reg);
  return arr ? arr[1] : '';
}

function parseNativeLocation(nativeLocation: NativeLocation, paramsKey: string, base64: boolean, parse: (str: string) => any): {searchParams: any; hashParams: any} {
  let search = splitSearch(nativeLocation.search, paramsKey);
  let hash = splitSearch(nativeLocation.hash, paramsKey);
  if (base64) {
    search = env.decodeBas64(search);
    hash = env.decodeBas64(hash);
  } else {
    search = search && decodeURIComponent(search);
    hash = hash && decodeURIComponent(hash);
  }

  return {searchParams: search ? parse(search) : undefined, hashParams: hash ? parse(hash) : undefined};
}
function toNativeLocation(pathname: string, search: any, hash: any, paramsKey: string, base64: boolean, stringify: (data: any) => string): NativeLocation {
  let searchStr = search ? stringify(search) : '';
  let hashStr = hash ? stringify(hash) : '';
  if (base64) {
    searchStr = env.encodeBas64(searchStr);
    hashStr = env.encodeBas64(hashStr);
  } else {
    searchStr = searchStr && encodeURIComponent(searchStr);
    hashStr = hashStr && encodeURIComponent(hashStr);
  }
  return {pathname: `/${pathname.replace(/^\/+|\/+$/g, '')}`, search: searchStr && `${paramsKey}=${searchStr}`, hash: hashStr && `${paramsKey}=${hashStr}`};
}

function dataIsNativeLocation(data: PartialLocation | NativeLocation): data is NativeLocation {
  return data['pathname'];
}

export function createLocationTransform<P extends RootParams>(
  defaultParams: P,
  pagenameMap: PagenameMap<P>,
  nativeLocationMap: NativeLocationMap,
  notfoundPagename: string = '/404',
  base64: boolean = false,
  serialization: {parse(str: string): any; stringify(data: any): string} = JSON,
  paramsKey: string = '_'
): LocationTransform<P> {
  routeConfig.defaultParams = defaultParams;
  let pagenames = Object.keys(pagenameMap);
  pagenameMap = pagenames
    .sort((a, b) => b.length - a.length)
    .reduce((map, pagename) => {
      const fullPagename = `/${pagename}/`.replace(/^\/+|\/+$/g, '/');
      map[fullPagename] = pagenameMap[pagename];
      return map;
    }, {});
  routeConfig.pagenames = pagenames.reduce((obj, key) => {
    obj[key] = key;
    return obj;
  }, {});
  pagenames = Object.keys(pagenameMap);

  function toStringArgs(arr: any[]): Array<string | undefined> {
    return arr.map((item) => {
      if (item === null || item === undefined) {
        return undefined;
      }
      return item.toString();
    });
  }
  return {
    in(data) {
      let path: string;
      if (dataIsNativeLocation(data)) {
        data = nativeLocationMap.in(data);
        path = data.pathname;
      } else {
        path = data.pagename;
      }
      path = `/${path}/`.replace(/^\/+|\/+$/g, '/');
      let pagename = pagenames.find((name) => path.startsWith(name));
      let params: DeepPartial<P>;
      if (pagename) {
        if (dataIsNativeLocation(data)) {
          const {searchParams, hashParams} = parseNativeLocation(data, paramsKey, base64, serialization.parse);
          const pathArgs: Array<string | undefined> = path
            .replace(pagename, '')
            .split('/')
            .map((item) => (item ? decodeURIComponent(item) : undefined));
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
      return {pagename: `/${pagename.replace(/^\/+|\/+$/g, '')}`, params: assignDefaultData(params) as P};
    },
    out(meduxLocation): NativeLocation {
      let params = excludeDefault(meduxLocation.params, defaultParams, true) as DeepPartial<P>;
      const pagename = `/${meduxLocation.pagename}/`.replace(/^\/+|\/+$/g, '/');
      let pathParams: DeepPartial<P>;
      let pathname: string;
      if (pagenameMap[pagename]) {
        const pathArgs = toStringArgs(pagenameMap[pagename].paramsToArgs(params));
        pathParams = pagenameMap[pagename].argsToParams(pathArgs);
        pathname =
          pagename +
          pathArgs
            .map((item) => item && encodeURIComponent(item))
            .join('/')
            .replace(/\/*$/, '');
      } else {
        pathParams = {};
        pathname = pagename;
      }
      params = excludeDefault(params, pathParams, false) as DeepPartial<P>;
      const result = splitPrivate(params, pathParams as any);
      const nativeLocation = toNativeLocation(pathname, result[0], result[1], paramsKey, base64, serialization.stringify);
      return nativeLocationMap.out(nativeLocation);
    },
  };
}
