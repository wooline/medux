import {BaseRouter, NativeRouter, createLocationTransform, DeepPartial, RootParams} from 'src/index';

import nativeRouterMock from './nativeRouter';

jest.mock('./nativeRouter');

interface MemberRouteParams {
  listView: string;
  listSearchPre: {pageSize: number; pageCurrent: number; term: string | null};
  _listVerPre: number;
  itemView: string;
  itemIdPre: string;
  _itemVerPre: number;
}

const defaultMemberRouteParams: MemberRouteParams = {
  listSearchPre: {
    pageSize: 10,
    pageCurrent: 1,
    term: null,
  },
  listView: '',
  _listVerPre: 0,
  itemIdPre: '',
  itemView: '',
  _itemVerPre: 0,
};
interface ArticleRouteParams {
  listView: string;
  listSearchPre: {pageSize: number; pageCurrent: number; term: string | null};
  _listVerPre: number;
  itemView: string;
  itemIdPre: string;
  _itemVerPre: number;
}
const defaultArticleRouteParams: ArticleRouteParams = {
  listSearchPre: {
    pageSize: 10,
    pageCurrent: 1,
    term: null,
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

const pagenameMap = {
  '/admin/member': {
    argsToParams() {
      const params: PartialRouteParams = {admin: {}, member: {}};
      return params;
    },
    paramsToArgs() {
      return [];
    },
  },
  '/admin/member/list': {
    argsToParams([pageCurrent, term]: Array<string | undefined>) {
      const params: PartialRouteParams = {admin: {}, member: {listView: 'list', listSearchPre: {}}};
      if (pageCurrent) {
        params.member!.listSearchPre!.pageCurrent = parseInt(pageCurrent, 10);
      }
      if (term) {
        params.member!.listSearchPre!.term = term;
      }
      return params;
    },
    paramsToArgs(params: PartialRouteParams) {
      const {pageCurrent, term} = params.member?.listSearchPre || {};
      return [pageCurrent, term];
    },
  },
  '/admin/member/detail': {
    argsToParams([itemIdPre]: Array<string | undefined>) {
      const params: PartialRouteParams = {admin: {}, member: {itemView: 'detail', itemIdPre}};
      return params;
    },
    paramsToArgs(params: PartialRouteParams) {
      const {itemIdPre} = params.member || {};
      return [itemIdPre];
    },
  },
};

export type Pagename = keyof typeof pagenameMap;

export const locationTransform = createLocationTransform(defaultRouteParams, pagenameMap, {
  in(nativeLocation) {
    let pathname = nativeLocation.pathname;
    if (pathname === '/' || pathname === '/admin2') {
      pathname = '/admin/member2';
    }
    return {...nativeLocation, pathname: pathname.replace('/member2', '/member')};
  },
  out(nativeLocation) {
    const pathname = nativeLocation.pathname;
    return {...nativeLocation, pathname: pathname.replace('/member', '/member2')};
  },
});
export class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> {
  destroy() {}
}

export const nativeRouter: NativeRouter = {
  push(getUrl, key, internal) {
    nativeRouterMock.push(getUrl(), key, internal);
  },
  replace(getUrl, key, internal) {
    nativeRouterMock.replace(getUrl(), key, internal);
  },
  relaunch(getUrl, key, internal) {
    nativeRouterMock.relaunch(getUrl(), key, internal);
  },
  back(getUrl, n, key, internal) {
    nativeRouterMock.back(getUrl(), n, key, internal);
  },
  pop(getUrl, n, key, internal) {
    nativeRouterMock.pop(getUrl(), n, key, internal);
  },
};

export const router = new Router('/', nativeRouter, locationTransform);
router.setStore({
  dispatch() {
    return undefined;
  },
});
