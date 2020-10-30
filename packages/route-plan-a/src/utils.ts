import {PaLocation, LocationPayload} from './index';

// export function checkPathname(pathname: string, curPathname: string): string {
//   curPathname = `/${curPathname}`.replace('//', '/').replace(/\/$/, '');
//   if (pathname.startsWith('./')) {
//     pathname = curPathname + pathname.replace('./', '/');
//   } else if (pathname.startsWith('../')) {
//     const n = pathname.match(/\.\.\//g)?.length || 0;
//     const arr = curPathname.split('/');
//     arr.length -= n;
//     pathname = `${arr.join('/')}/${pathname.replace(/\.\.\//g, '')}`;
//   } else {
//     pathname = `/${pathname}`.replace('//', '/');
//   }
//   return pathname;
// }
export function checkLocation(location: LocationPayload): PaLocation {
  const data: PaLocation = {...location} as any;
  data.search = `?${location.search || ''}`.replace('??', '?');
  data.hash = `#${location.hash || ''}`.replace('##', '#');
  if (data.search === '?') {
    data.search = '';
  }
  if (data.hash === '#') {
    data.hash = '';
  }
  return data;
}

// export function checkUrl(url: string, curPathname = ''): string {
//   if (!url) {
//     return '';
//   }
//   if (url !== url.replace(/^\w+:\/\/[^/]+/, '')) {
//     return '/';
//   }
//   url = checkPathname(url, curPathname);
//   return url.replace(/\/(?=[?#]|$)/, '');
// }

export function urlToLocation(url: string): PaLocation {
  url = url.replace(/\/(?=[?#]|$)/, '');
  if (!url) {
    return {
      pathname: '/',
      search: '',
      hash: '',
    };
  }
  const arr = url.split(/[?#]/);
  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }
  const [pathname, search = '', hash = ''] = arr;

  return {
    pathname,
    search: search && `?${search}`,
    hash: hash && `#${hash}`,
  };
}
