"use strict";

exports.__esModule = true;
exports.checkLocation = checkLocation;
exports.urlToLocation = urlToLocation;

function checkLocation(location) {
  var data = Object.assign({}, location);
  data.search = ("?" + (location.search || '')).replace('??', '?');
  data.hash = ("#" + (location.hash || '')).replace('##', '#');

  if (data.search === '?') {
    data.search = '';
  }

  if (data.hash === '#') {
    data.hash = '';
  }

  return data;
}

function urlToLocation(url) {
  url = url.replace(/\/(?=[?#]|$)/, '');

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
    search: search && "?" + search,
    hash: hash && "#" + hash
  };
}