import {MeduxLocation} from './index';

export function checkUrl(url: string, curPathname: string = ''): string {
  if (url !== url.replace(/^\w+:\/\/[^/]+/, '')) {
    return '';
  }
  curPathname = ('/' + curPathname).replace('//', '/').replace(/\/$/, '');
  if (url.startsWith('./')) {
    url = curPathname + url.replace('./', '/');
  } else if (url.startsWith('../')) {
    const n = url.match(/\.\.\//g)?.length || 0;
    const arr = curPathname.split('/');
    arr.length = arr.length - n;
    url = arr.join('/') + '/' + url.replace(/\.\.\//g, '');
  } else {
    url = ('/' + url).replace('//', '/');
  }
  return url.replace(/\/(?=[?#]|$)/, '');
}

export function urlToLocation(url: string): MeduxLocation {
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
    search: search && '?' + search,
    hash: hash && '#' + hash,
  };
}
export function locationToUrl(location: MeduxLocation): string {
  return location.pathname + location.search + location.hash;
}
