import {locationTransform} from './tools';

describe('locationTransform', () => {
  test('in /', () => {
    expect(locationTransform.in({pathname: '/', search: '', hash: ''})).toEqual({
      pagename: '/admin/member',
      params: {
        admin: {},
        member: {
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
        },
      },
    });
  });
  test('in /admin2//', () => {
    expect(locationTransform.in({pathname: '/admin2//', search: '', hash: ''})).toEqual({
      pagename: '/admin2',
      params: {},
    });
  });
  test('in /admin2/', () => {
    expect(locationTransform.in({pathname: '/admin2/', search: '', hash: ''})).toEqual({
      pagename: '/admin2',
      params: {},
    });
  });
  test('in /admin/member/list/', () => {
    expect(locationTransform.in({pathname: '/admin/member/list/', search: '', hash: ''})).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 1,
            term: undefined,
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
  test('in /admin/member/list/3', () => {
    expect(locationTransform.in({pathname: '/admin/member/list/3', search: '', hash: ''})).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 3,
            term: undefined,
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
  test('in /admin/member/list/3/aaa', () => {
    expect(locationTransform.in({pathname: '/admin/member/list/3/aaa', search: '', hash: ''})).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 3,
            term: 'aaa',
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
  test('in /admin/member/list/3/aaa/', () => {
    expect(locationTransform.in({pathname: '/admin/member/list/3/aaa/', search: '', hash: ''})).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 3,
            term: 'aaa',
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
  test('in /admin/member/list/3//', () => {
    expect(locationTransform.in({pathname: '/admin/member/list/3//', search: '', hash: ''})).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 3,
            term: undefined,
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
  test('in /admin/member/list//aaa/', () => {
    expect(locationTransform.in({pathname: '/admin/member/list//aaa/', search: '', hash: ''})).toEqual({
      pagename: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 1,
            term: 'aaa',
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
  test('in /admin/member/detail/1', () => {
    expect(locationTransform.in({pathname: '/admin/member/detail/1', search: '_={"member":{"listSearchPre":{"pageCurrent":2,"pageCurrent2":3}}}', hash: ''})).toEqual({
      pagename: '/admin/member/detail',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 2,
            term: undefined,
          },
          listView: '',
          _listVerPre: 0,
          itemIdPre: '1',
          itemView: 'detail',
          _itemVerPre: 0,
        },
      },
    });
  });
  test('in /admin/member/detail/1/aaa/', () => {
    expect(
      locationTransform.in({
        pathname: '/admin/member/detail/1/aaa/',
        search: '_={"member":{"listSearchPre":{"pageCurrent":2,"pageCurrent2":3}}}',
        hash: '_={"member":{"_listVerPre":2,"_itemVerPre": 3}}',
      })
    ).toEqual({
      pagename: '/admin/member/detail',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 2,
            term: undefined,
          },
          listView: '',
          _listVerPre: 2,
          itemIdPre: '1',
          itemView: 'detail',
          _itemVerPre: 3,
        },
      },
    });
  });
  test('in /admin/member/detail/http%3A%2F%2Fwww.baidu.com%2Faa%3Fbb%3D1%26cc%3D2/', () => {
    expect(
      locationTransform.in({
        pathname: '/admin/member/detail/http%3A%2F%2Fwww.baidu.com%2Faa%3Fbb%3D1%26cc%3D2/',
        search: '_={"member":{"listSearchPre":{"pageCurrent":2,"pageCurrent2":3}}}',
        hash: '_={"member":{"_listVerPre":2,"_itemVerPre": 3}}',
      })
    ).toEqual({
      pagename: '/admin/member/detail',
      params: {
        admin: {},
        member: {
          listSearchPre: {
            pageSize: 10,
            pageCurrent: 2,
            term: undefined,
          },
          listView: '',
          _listVerPre: 2,
          itemIdPre: 'http://www.baidu.com/aa?bb=1&cc=2',
          itemView: 'detail',
          _itemVerPre: 3,
        },
      },
    });
  });
});

describe('locationTransform', () => {
  test('out /', () => {
    expect(
      locationTransform.out({
        pagename: '//',
        params: {
          admin: {},
          member: {
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
          },
        },
      })
    ).toEqual({
      pathname: '/',
      search: '',
      hash: '',
    });
  });
  test('out /admin/member', () => {
    expect(
      locationTransform.out({
        pagename: '/admin/member',
        params: {
          admin: {},
          member: {
            listSearchPre: {
              pageSize: 10,
              pageCurrent: 2,
              term: 'aaa',
            },
            listView: '',
            _listVerPre: 2,
            itemIdPre: '',
            itemView: '',
            _itemVerPre: 0,
          },
        },
      })
    ).toEqual({
      pathname: '/admin/member',
      search: '_={"member":{"listSearchPre":{"pageCurrent":2,"term":"aaa"}}}',
      hash: '_={"member":{"_listVerPre":2}}',
    });
  });
  test('out admin/member/list', () => {
    expect(
      locationTransform.out({
        pagename: 'admin/member/list',
        params: {
          admin: {},
          member: {
            listSearchPre: {
              pageSize: 10,
              pageCurrent: 2,
              term: 'aaa',
            },
            listView: '',
            _listVerPre: 2,
            itemIdPre: '',
            itemView: '',
            _itemVerPre: 0,
          },
        },
      })
    ).toEqual({
      pathname: '/admin/member/list/2/aaa',
      search: '',
      hash: '_={"member":{"_listVerPre":2}}',
    });
  });
  test('out /admin/member/list', () => {
    expect(
      locationTransform.out({
        pagename: '/admin/member/list',
        params: {
          admin: {},
          member: {
            listSearchPre: {
              pageSize: 10,
              pageCurrent: 2,
              term: 'aaa',
            },
            listView: '',
            _listVerPre: 0,
            itemIdPre: '',
            itemView: '',
            _itemVerPre: 0,
          },
        },
      })
    ).toEqual({
      pathname: '/admin/member/list/2/aaa',
      search: '',
      hash: '',
    });
  });
  test('out /admin/member/list', () => {
    expect(
      locationTransform.out({
        pagename: '/admin/member/list',
        params: {
          admin: {},
          member: {
            listSearchPre: {
              pageSize: 10,
              pageCurrent: 2,
              term: 'http://www.baidu.com/aa?bb=1&cc=2',
            },
            listView: '',
            _listVerPre: 0,
            itemIdPre: '',
            itemView: '',
            _itemVerPre: 0,
          },
        },
      })
    ).toEqual({
      pathname: '/admin/member/list/2/http%3A%2F%2Fwww.baidu.com%2Faa%3Fbb%3D1%26cc%3D2',
      search: '',
      hash: '',
    });
  });
});
