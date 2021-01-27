import {BaseRouter, NativeRouter, createLocationTransform, createPathnameTransform, PagenameMap, DeepPartial} from 'src/index';

import nativeRouterMock from './nativeRouter';

jest.mock('./nativeRouter');

interface MemberRouteParams {
  listView: string;
  listSearchPre: {pageSize: number; pageCurrent: number; term?: string};
  _listVerPre: number;
  itemView: string;
  itemIdPre: string;
  _itemVerPre: number;
}

const defaultMemberRouteParams: MemberRouteParams = {
  listSearchPre: {
    pageSize: 10,
    pageCurrent: 1,
    term: undefined,
  },
  listView: '',
  _listVerPre: 0,
  itemIdPre: '',
  itemView: '',
  _itemVerPre: 0,
};
interface ArticleRouteParams {
  listView: string;
  listSearchPre: {pageSize: number; pageCurrent: number; term?: string};
  _listVerPre: number;
  itemView: string;
  itemIdPre: string;
  _itemVerPre: number;
}
const defaultArticleRouteParams: ArticleRouteParams = {
  listSearchPre: {
    pageSize: 10,
    pageCurrent: 1,
    term: undefined,
  },
  listView: '',
  _listVerPre: 0,
  itemIdPre: '',
  itemView: '',
  _itemVerPre: 0,
};
export const defaultRouteParams = {
  admin: {},
  member: defaultMemberRouteParams,
  article: defaultArticleRouteParams,
};

type RouteParams = typeof defaultRouteParams;
type PartialRouteParams = DeepPartial<RouteParams>;

const pathnameIn = (pathname: string) => {
  if (pathname === '/' || pathname === '/admin') {
    return '/admin/member';
  }
  return pathname;
};

const pagenameMap: PagenameMap<PartialRouteParams> = {
  '/admin/member': {
    in() {
      return {admin: {}, member: {}};
    },
    out() {
      return [];
    },
  },
  '/admin/member/list': {
    in([pageCurrent, term]) {
      const pathParams: PartialRouteParams = {admin: {}, member: {listView: 'list', listSearchPre: {}}};
      if (pageCurrent) {
        pathParams.member!.listSearchPre!.pageCurrent = parseInt(pageCurrent, 10);
      }
      if (term) {
        pathParams.member!.listSearchPre!.term = term;
      }
      return pathParams;
    },
    out(params) {
      const {pageCurrent, term} = params.member?.listSearchPre || {};
      return [pageCurrent, term];
    },
  },
  '/admin/member/detail': {
    in([itemIdPre]) {
      return {admin: {}, member: {itemView: 'detail', itemIdPre}};
    },
    out(params) {
      const {itemIdPre} = params.member || {};
      return [itemIdPre];
    },
  },
};

export const locationTransform = createLocationTransform(createPathnameTransform(pathnameIn, pagenameMap), defaultRouteParams);
export class Router extends BaseRouter<RouteParams> {
  destroy() {}
}

export const nativeRouter: NativeRouter = {
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
    nativeRouterMock.push(location, key);
  },
  replace(location, key) {
    nativeRouterMock.replace(location, key);
  },
  relaunch(location, key) {
    nativeRouterMock.relaunch(location, key);
  },
  back(location, n, key) {
    nativeRouterMock.back(location, n, key);
  },
  pop(location, n, key) {
    nativeRouterMock.pop(location, n, key);
  },
};
