export function checkPathname(pathname, curPathname) {
  curPathname = ("/" + curPathname).replace('//', '/').replace(/\/$/, '');

  if (pathname.startsWith('./')) {
    pathname = curPathname + pathname.replace('./', '/');
  } else if (pathname.startsWith('../')) {
    var _pathname$match;

    var n = ((_pathname$match = pathname.match(/\.\.\//g)) === null || _pathname$match === void 0 ? void 0 : _pathname$match.length) || 0;
    var arr = curPathname.split('/');
    arr.length -= n;
    pathname = arr.join('/') + "/" + pathname.replace(/\.\.\//g, '');
  } else {
    pathname = ("/" + pathname).replace('//', '/');
  }

  return pathname;
}
export function checkLocation(location, curPathname) {
  var data = Object.assign({}, location);
  data.pathname = checkPathname(data.pathname || '/', curPathname);
  data.search = ("?" + (data.search || '')).replace('??', '?');
  data.hash = ("#" + (data.hash || '')).replace('##', '#');

  if (data.search === '?') {
    data.search = '';
  }

  if (data.hash === '#') {
    data.hash = '';
  }

  return data;
}
export function safelocationToUrl(safeLocation) {
  return safeLocation.pathname + safeLocation.search + safeLocation.hash;
}
export function checkUrl(url, curPathname) {
  if (curPathname === void 0) {
    curPathname = '';
  }

  if (url !== url.replace(/^\w+:\/\/[^/]+/, '')) {
    return '/';
  }

  url = checkPathname(url, curPathname);
  return url.replace(/\/(?=[?#]|$)/, '');
}
export function safeurlToLocation(safeurl) {
  if (!safeurl) {
    return {
      pathname: '/',
      search: '',
      hash: ''
    };
  }

  var arr = safeurl.split(/[?#]/);

  if (arr.length === 2 && safeurl.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  var pathname = arr[0],
      _arr$ = arr[1],
      search = _arr$ === void 0 ? '' : _arr$,
      _arr$2 = arr[2],
      hash = _arr$2 === void 0 ? '' : _arr$2;
  return {
    pathname: pathname,
    search: search && "?" + search,
    hash: hash && "#" + hash
  };
}