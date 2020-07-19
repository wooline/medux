import {MeduxLocation} from './index';

export function checkPathname(pathname: string, curPathname: string): string {
  curPathname = ('/' + curPathname).replace('//', '/').replace(/\/$/, '');
  if (pathname.startsWith('./')) {
    pathname = curPathname + pathname.replace('./', '/');
  } else if (pathname.startsWith('../')) {
    const n = pathname.match(/\.\.\//g)?.length || 0;
    const arr = curPathname.split('/');
    arr.length = arr.length - n;
    pathname = arr.join('/') + '/' + pathname.replace(/\.\.\//g, '');
  } else {
    pathname = ('/' + pathname).replace('//', '/');
  }
  return pathname;
}
export function checkLocation(location: Partial<MeduxLocation>, curPathname: string): MeduxLocation {
  const data: MeduxLocation = {...location} as any;
  data.pathname = checkPathname(data.pathname || '/', curPathname);
  data.search = ('?' + (data.search || '')).replace('??', '?');
  data.hash = ('#' + (data.hash || '')).replace('##', '#');
  if (data.search === '?') {
    data.search = '';
  }
  if (data.hash === '#') {
    data.hash = '';
  }
  return data;
}
export function safelocationToUrl(safeLocation: MeduxLocation): string {
  return safeLocation.pathname + safeLocation.search + safeLocation.hash;
}

export function checkUrl(url: string, curPathname: string = ''): string {
  if (url !== url.replace(/^\w+:\/\/[^/]+/, '')) {
    return '/';
  }
  url = checkPathname(url, curPathname);
  return url.replace(/\/(?=[?#]|$)/, '');
}

export function safeurlToLocation(safeurl: string): MeduxLocation {
  if (!safeurl) {
    return {
      pathname: '/',
      search: '',
      hash: '',
    };
  }
  const arr = safeurl.split(/[?#]/);
  if (arr.length === 2 && safeurl.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }
  const [pathname, search = '', hash = ''] = arr;
  return {
    pathname,
    search: search && '?' + search,
    hash: hash && '#' + hash,
  };
}
