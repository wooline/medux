import {deepMerge} from '@medux/core';
import {extendDefault, excludeDefault, splitPrivate} from './deep-extend';
import {Location, NativeLocation, DeepPartial, RootParams, routeConfig, PartialLocation} from './basic';

export type LocationTransform<P extends RootParams> = {
  in: (nativeLocation: NativeLocation | PartialLocation<P>) => Location<P>;
  out: (meduxLocation: PartialLocation<P>) => NativeLocation;
};

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

function dataIsNativeLocation(data: PartialLocation | NativeLocation): data is NativeLocation {
  return data['pathname'];
}

export function createLocationTransform<P extends RootParams>(
  defaultParams: P,
  pagenameMap: PagenameMap<P>,
  nativeLocationMap: NativeLocationMap,
  notfoundPagename: string = '/404',
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
          const searchParams = data.searchData && data.searchData[paramsKey] ? JSON.parse(data.searchData[paramsKey]) : undefined;
          const hashParams = data.hashData && data.hashData[paramsKey] ? JSON.parse(data.hashData[paramsKey]) : undefined;
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
      const nativeLocation = {
        pathname: `/${pathname.replace(/^\/+|\/+$/g, '')}`,
        searchData: result[0] ? {[paramsKey]: JSON.stringify(result[0])} : undefined,
        hashData: result[1] ? {[paramsKey]: JSON.stringify(result[1])} : undefined,
      };
      return nativeLocationMap.out(nativeLocation);
    },
  };
}
