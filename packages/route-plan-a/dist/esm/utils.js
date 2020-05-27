export function checkUrl(url, curPathname) {
  if (curPathname === void 0) {
    curPathname = '';
  }

  if (url !== url.replace(/^\w+:\/\/[^/]+/, '')) {
    return '';
  }

  curPathname = ('/' + curPathname).replace('//', '/').replace(/\/$/, '');

  if (url.startsWith('./')) {
    url = curPathname + url.replace('./', '/');
  } else if (url.startsWith('../')) {
    var _url$match;

    var n = ((_url$match = url.match(/\.\.\//g)) === null || _url$match === void 0 ? void 0 : _url$match.length) || 0;
    var arr = curPathname.split('/');
    arr.length = arr.length - n;
    url = arr.join('/') + '/' + url.replace(/\.\.\//g, '');
  } else {
    url = ('/' + url).replace('//', '/');
  }

  return url.replace(/\/(?=[?#]|$)/, '');
}
export function urlToLocation(url) {
  if (!url) {
    return {
      pathname: '/',
      search: '',
      hash: ''
    };
  }

  var arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  var pathname = arr[0],
      _arr$ = arr[1],
      search = _arr$ === void 0 ? '' : _arr$,
      _arr$2 = arr[2],
      hash = _arr$2 === void 0 ? '' : _arr$2;
  return {
    pathname: pathname,
    search: search && '?' + search,
    hash: hash && '#' + hash
  };
}
export function locationToUrl(location) {
  return location.pathname + location.search + location.hash;
}