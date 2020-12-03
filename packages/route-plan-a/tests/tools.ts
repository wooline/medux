import {BaseHistoryActions, NativeHistory} from 'src/index';

import nativeHistoryMock from './nativeHistory';

jest.mock('./nativeHistory');
export interface PhotosRouteParams {
  itemId: string;
  _detailKey: string;
  _listKey: string;
  listSearch: {
    title: string;
    page: number;
    pageSize: number;
  };
}
export const photoDefaultParams: PhotosRouteParams = {
  _detailKey: '',
  _listKey: '',
  itemId: '',
  listSearch: {
    title: '',
    page: 1,
    pageSize: 10,
  },
};
export interface CommentsRouteParams {
  itemId: string;
  articleType: 'videos' | 'photos';
  articleId: string;
  _detailKey: string;
  _listKey: string;
  // 将搜索条件中的articleType和articleId放在path路径中传递
  listSearch: {
    isNewest: boolean;
    page: number;
    pageSize: number;
  };
}

export const commentsDefaultParams: CommentsRouteParams = {
  _detailKey: '',
  _listKey: '',
  itemId: '',
  articleType: 'photos',
  articleId: '',
  listSearch: {
    isNewest: false,
    page: 1,
    pageSize: 10,
  },
};
export const defaultRouteParams = {
  app: {},
  photos: photoDefaultParams,
  comments: commentsDefaultParams,
};

type RouteParams = typeof defaultRouteParams;

export class HistoryActions extends BaseHistoryActions<RouteParams> {
  destroy() {}
}

export const nativeHistory: NativeHistory = {
  getLocation() {
    return {
      pathname: '/',
      search: '',
      hash: '',
    };
  },
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
    nativeHistoryMock.push(location, key);
  },
  replace(location, key) {
    nativeHistoryMock.replace(location, key);
  },
  relaunch(location, key) {
    nativeHistoryMock.relaunch(location, key);
  },
  pop(location, n, key) {
    nativeHistoryMock.pop(location, n, key);
  },
};
