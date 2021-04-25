import {router} from './tools';

describe('init', () => {
  test('init', () => {
    expect(router.getMeduxUrl()).toBe(
      '/admin/member?{"admin":{},"member":{"listSearchPre":{"pageSize":10,"pageCurrent":1,"term":null},"listView":"","_listVerPre":0,"itemIdPre":"","itemView":"","_itemVerPre":0}}'
    );
    expect(router.getNativeUrl()).toBe('/admin/member2');
    expect(router.getNativeLocation()).toEqual({
      pathname: '/admin/member2',
      searchData: undefined,
      hashData: undefined,
    });
    expect(router.getRouteState()).toEqual({
      pagename: '/admin/member',
      params: {
        admin: {},
        member: {
          listSearchPre: {pageSize: 10, pageCurrent: 1, term: null},
          listView: '',
          _listVerPre: 0,
          itemIdPre: '',
          itemView: '',
          _itemVerPre: 0,
        },
      },
      key: '1',
      action: 'RELAUNCH',
    });
  });
});
describe('/404', () => {
  test('nativeUrlToLocation', () => {
    expect(router.urlToLocation('admin3/member')).toEqual({
      pagename: '/404',
      params: {},
    });
  });
  test('urlToLocation', () => {
    expect(router.urlToLocation('/admin3/member?{"aaa":1}')).toEqual({
      pagename: '/404',
      params: {},
    });
  });
});
describe('/admin/member', () => {
  test('nativeUrlToLocation', () => {
    expect(router.urlToLocation('admin/member')).toEqual({
      pagename: '/admin/member',
      params: {
        admin: {},
        member: {
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
        },
      },
    });
    expect(router.urlToLocation('admin/member2//?')).toEqual({
      pagename: '/admin/member',
      params: {
        admin: {},
        member: {
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
        },
      },
    });
    expect(
      router.urlToLocation(
        '/admin/member2?_=%7B%22member%22%3A%7B%22listSearchPre%22%3A%7B%22pageSize%22%3A11%7D%7D%7D#_=%7B%22member%22%3A%7B%22_itemVerPre%22%3A1%7D%7D'
      )
    ).toEqual({
      pagename: '/admin/member',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 11,
            pageCurrent: 1,
            term: null,
          },
          listView: '',
          _listVerPre: 0,
          itemIdPre: '',
          itemView: '',
          _itemVerPre: 1,
        },
      },
    });
    expect(
      router.urlToLocation(
        '/admin/member2/list/2/aaa//?_=%7B%22member%22%3A%7B%22listSearchPre%22%3A%7B%22pageSize%22%3A11%7D%7D%7D#_=%7B%22member%22%3A%7B%22_itemVerPre%22%3A1%7D%7D'
      )
    ).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 11,
            pageCurrent: 2,
            term: 'aaa',
          },
          listView: 'list',
          _listVerPre: 0,
          itemIdPre: '',
          itemView: '',
          _itemVerPre: 1,
        },
      },
    });
  });
  test('urlToLocation', () => {
    expect(router.urlToLocation('/admin/member?{}')).toEqual({
      pagename: '/admin/member',
      params: {
        admin: {},
        member: {
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
        },
      },
    });
    expect(router.urlToLocation('/admin/member?{"member":{"aaa":1}}')).toEqual({
      pagename: '/admin/member',
      params: {
        admin: {},
        member: {
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
        },
      },
    });
  });
});
describe('/admin/member/list', () => {
  test('nativeUrlToLocation', () => {
    expect(router.urlToLocation('/admin/member2/list')).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 1,
            term: null,
          },
          listView: 'list',
          _listVerPre: 0,
          itemIdPre: '',
          itemView: '',
          _itemVerPre: 0,
        },
      },
    });
    expect(router.urlToLocation('/admin/member2/list/6')).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 6,
            term: null,
          },
          listView: 'list',
          _listVerPre: 0,
          itemIdPre: '',
          itemView: '',
          _itemVerPre: 0,
        },
      },
    });
    expect(router.urlToLocation('/admin/member2/list/6/http%3A%2F%2Fwww.baidu.com%2Faa%3Fbb%3D1%26cc%3D2%23dd%3D3/')).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 6,
            term: 'http://www.baidu.com/aa?bb=1&cc=2#dd=3',
          },
          listView: 'list',
          _listVerPre: 0,
          itemIdPre: '',
          itemView: '',
          _itemVerPre: 0,
        },
      },
    });
    expect(
      router.urlToLocation(
        '/admin/member2/list/6/http%3A%2F%2Fwww.baidu.com%2Faa%3Fbb%3D1%26cc%3D2%23dd%3D3?_=%7B%22member%22%3A%7B%22listSearchPre%22%3A%7B%22term%22%3A%22%E5%A4%A7%E5%A4%A7%22%7D%7D%7D'
      )
    ).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 6,
            term: '大大',
          },
          listView: 'list',
          _listVerPre: 0,
          itemIdPre: '',
          itemView: '',
          _itemVerPre: 0,
        },
      },
    });
  });
  test('urlToLocation', () => {
    expect(router.urlToLocation('/admin/member/list?{"member":{"listSearchPre":{"term":"大大","term2":"小小"}}}')).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 1,
            term: '大大',
          },
          listView: 'list',
          _listVerPre: 0,
          itemIdPre: '',
          itemView: '',
          _itemVerPre: 0,
        },
      },
    });
  });
});
describe('/admin/member/detail', () => {
  test('nativeUrlToLocation', () => {
    expect(router.urlToLocation('/admin/member2/detail/3/')).toEqual({
      pagename: '/admin/member/detail',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 1,
            term: null,
          },
          listView: '',
          _listVerPre: 0,
          itemIdPre: '3',
          itemView: 'detail',
          _itemVerPre: 0,
        },
      },
    });
  });
  test('urlToLocation', () => {
    expect(router.urlToLocation('/admin/member/detail?{"member":{"itemIdPre":"4"}}')).toEqual({
      pagename: '/admin/member/detail',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 1,
            term: null,
          },
          listView: '',
          _listVerPre: 0,
          itemIdPre: '4',
          itemView: 'detail',
          _itemVerPre: 0,
        },
      },
    });
  });
});
