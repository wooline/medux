import {NativeRouter} from 'src/index';

const nativeRouter: NativeRouter = {
  parseUrl(url: string) {
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
      search,
      hash,
    };
  },
  toUrl(location) {
    return [location.pathname, location.search && `?${location.search}`, location.hash && `#${location.hash}`].join('');
  },
  push(location, key) {
    console.log('push', key);
  },
  replace(location, key) {
    console.log('replace', key);
  },
  relaunch(location, key) {
    console.log('relaunch', key);
  },
  back(location, n, key) {
    console.log('back', n, key);
  },
  pop(location, n, key) {
    console.log('pop', n, key);
  },
};

export default nativeRouter;
