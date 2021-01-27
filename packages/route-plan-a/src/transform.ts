import {deepMerge, env} from '@medux/core';
import {extendDefault, excludeDefault, splitPrivate} from './deep-extend';
import type {Location, NativeLocation} from './basic';

export type LocationTransform<P extends {[key: string]: any}, NL extends NativeLocation = NativeLocation> = {in: (nativeLocation: NL) => Location<P>; out: (meduxLocation: Location<P>) => NL};

function assignDefaultData(data: {[moduleName: string]: any}, def: {[moduleName: string]: any}): {[moduleName: string]: any} {
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
function parseNativeLocation(nativeLocation: NativeLocation, paramsKey: string, base64: boolean, parse: (str: string) => any): {pathname: string; searchParams: any; hashParams: any} {
  let search = splitSearch(nativeLocation.search, paramsKey);
  let hash = splitSearch(nativeLocation.hash, paramsKey);
  if (base64) {
    search = search && decodeBas64(search);
    hash = hash && decodeBas64(hash);
  }
  let pathname = nativeLocation.pathname;
  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }
  return {pathname: pathname.replace(/\/*$/, '') || '/', searchParams: search ? parse(search) : undefined, hashParams: hash ? parse(hash) : undefined};
}
function toNativeLocation(pagename: string, search: any, hash: any, paramsKey: string, base64: boolean, stringify: (data: any) => string): NativeLocation {
  let searchStr = search ? stringify(search) : '';
  let hashStr = hash ? stringify(hash) : '';
  if (base64) {
    searchStr = searchStr ? encodeBas64(searchStr) : '';
    hashStr = hashStr ? encodeBas64(hashStr) : '';
  }
  const pathname = `/${pagename}`.replace(/\/+/g, '/');
  return {pathname: pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname, search: searchStr ? `${paramsKey}=${searchStr}` : '', hash: hashStr ? `${paramsKey}=${hashStr}` : ''};
}
export type PathnameTransform<P extends {[key: string]: any}> = {
  in(pathname: string): {pagename: string; pathParams: P};
  out(pagename: string, params: P): {pathname: string; pathParams: P};
};

export type PagenameMap<P extends {[key: string]: any}> = {
  [pagename: string]: {
    in(pathParams: Array<string | undefined>): P;
    out(params: P): Array<any>;
  };
};

export function createPathnameTransform<P extends {[key: string]: any}>(
  pathnameIn: (pathname: string) => string,
  pagenameMap: PagenameMap<P>,
  pathnameOut?: (pathname: string) => string
): PathnameTransform<P> {
  pagenameMap = Object.keys(pagenameMap)
    .sort((a, b) => b.length - a.length)
    .reduce((map, pagename) => {
      const fullPagename = `/${pagename}/`.replace('//', '/').replace('//', '/');
      map[fullPagename] = pagenameMap[pagename];
      return map;
    }, {});
  return {
    in(pathname) {
      pathname = pathnameIn(pathname);
      if (!pathname.endsWith('/')) {
        pathname = `${pathname}/`;
      }
      let pagename = Object.keys(pagenameMap).find((name) => pathname.startsWith(name));
      let pathParams: P;
      if (!pagename) {
        pagename = pathname.replace(/\/*$/, '');
        pathParams = {} as P;
      } else {
        const args = pathname
          .replace(pagename, '')
          .split('/')
          .map((item) => (item ? decodeURIComponent(item) : undefined));
        pathParams = pagenameMap[pagename].in(args);
        pagename = pagename.replace(/\/$/, '');
      }
      return {pagename, pathParams};
    },
    out(pagename, params) {
      pagename = `/${pagename}/`.replace('//', '/').replace('//', '/');
      let pathname: string;
      if (!pagenameMap[pagename]) {
        pathname = pagename.replace(/\/$/, '');
      } else {
        const args = pagenameMap[pagename].out(params);
        pathname =
          pagename +
          args
            .map((item) => item && encodeURIComponent(item))
            .join('/')
            .replace(/\/*$/, '');
      }
      if (pathnameOut) {
        pathname = pathnameOut(pathname);
      }
      const data = this.in(pathname);
      const pathParams = data.pathParams;
      return {pathname, pathParams};
    },
  };
}
export function createLocationTransform<P extends {[key: string]: any}>(
  pathnameTransform: PathnameTransform<P>,
  defaultData: P,
  base64: boolean = false,
  serialization: {parse(str: string): any; stringify(data: any): string} = JSON,
  paramsKey: string = '_'
): LocationTransform<P, NativeLocation> {
  return {
    in(nativeLocation: NativeLocation): Location<P> {
      const {pathname, searchParams, hashParams} = parseNativeLocation(nativeLocation, paramsKey, base64, serialization.parse);
      const {pagename, pathParams} = pathnameTransform.in(pathname);
      let params: any = deepMerge(pathParams, searchParams, hashParams);
      params = assignDefaultData(params, defaultData);
      return {pagename, params};
    },
    out(meduxLocation: Location<P>): NativeLocation {
      let params: any = excludeDefault(meduxLocation.params, defaultData, true);
      const {pathname, pathParams} = pathnameTransform.out(meduxLocation.pagename, params);
      params = excludeDefault(params, pathParams, false);
      const result = splitPrivate(params, pathParams as any);
      return toNativeLocation(pathname, result[0], result[1], paramsKey, base64, serialization.stringify);
    },
  };
}
