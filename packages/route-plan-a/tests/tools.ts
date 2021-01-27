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
  push(location, key, internal) {
    nativeRouterMock.push(location, key, internal);
  },
  replace(location, key, internal) {
    nativeRouterMock.replace(location, key, internal);
  },
  relaunch(location, key, internal) {
    nativeRouterMock.relaunch(location, key, internal);
  },
  back(location, n, key, internal) {
    nativeRouterMock.back(location, n, key, internal);
  },
  pop(location, n, key, internal) {
    nativeRouterMock.pop(location, n, key, internal);
  },
};
