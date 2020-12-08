import {BaseHistoryActions, NativeHistory, PathnameRules, createWebLocationTransform} from 'src/index';

import nativeHistoryMock from './nativeHistory';

jest.mock('./nativeHistory');

interface MemberRouteParams {
  listParams: {pageSize: number; pageCurrent: number; term?: string};
  listView: string;
  _listVer: number;
  id: string;
  itemView: string;
  _itemVer: number;
}

const defaultMemberRouteParams: MemberRouteParams = {
  listParams: {
    pageSize: 10,
    pageCurrent: 1,
    term: undefined,
  },
  listView: '',
  _listVer: 0,
  id: '',
  itemView: '',
  _itemVer: 0,
};
interface ArticleRouteParams {
  listParams: {pageSize: number; pageCurrent: number; term?: string};
  listView: string;
  _listVer: number;
  id: string;
  itemView: string;
  _itemVer: number;
}
const defaultArticleRouteParams: ArticleRouteParams = {
  listParams: {
    pageSize: 10,
    pageCurrent: 1,
    term: undefined,
  },
  listView: '',
  _listVer: 0,
  id: '',
  itemView: '',
  _itemVer: 0,
};
export const defaultRouteParams = {
  admin: {},
  member: defaultMemberRouteParams,
  article: defaultArticleRouteParams,
};

type RouteParams = typeof defaultRouteParams;

const pathnameRules: PathnameRules<RouteParams> = {
  '/$': () => {
    return '/admin/member';
  },
  '/:layoutModule$': ({layoutModule}: {layoutModule: string}) => {
    return `/${layoutModule}/${layoutModule}Home`;
  },
  '/:layoutModule/:module': ({layoutModule, module}: {layoutModule: string; module: string}, params) => {
    params[layoutModule] = {};
    params[module] = {};
    return {
      '/:listView$': ({listView}: {listView: string}) => {
        params[module].listView = listView;
      },
      '/:itemView/:id': ({itemView, id}: {itemView: string; id: string}) => {
        params[module].itemView = itemView;
        params[module].id = id;
      },
    };
  },
};

export const locationTransform = createWebLocationTransform(defaultRouteParams, pathnameRules);
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
