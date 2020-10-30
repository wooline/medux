export function checkLocation(location) {
  const data = Object.assign({}, location);
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
export function urlToLocation(url) {
  url = url.replace(/\/(?=[?#]|$)/, '');

  if (!url) {
    return {
      pathname: '/',
      search: '',
      hash: ''
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
    hash: hash && `#${hash}`
  };
}