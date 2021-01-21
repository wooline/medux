import {locationTransform} from './tools';

describe('locationTransform', () => {
  test('in /', () => {
    expect(locationTransform.in({pathname: '/', search: '', hash: ''})).toEqual({
      tag: '/admin/member',
      params: {
        admin: {},
        member: {
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
        },
      },
    });
  });
  test('in /admin', () => {
    expect(locationTransform.in({pathname: '/admin', search: '', hash: ''})).toEqual({
      tag: '/admin/adminHome',
      params: {
        admin: {},
      },
    });
  });
  test('in /admin/member/list', () => {
    expect(locationTransform.in({pathname: '/admin/member/list', search: '{"home":{}}', hash: ''})).toEqual({
      tag: '/admin/member/list',
      params: {
        admin: {},
        member: {
          listParams: {
            pageSize: 10,
            pageCurrent: 1,
            term: undefined,
          },
          listView: 'list',
          _listVer: 0,
          id: '',
          itemView: '',
          _itemVer: 0,
        },
      },
    });
  });
  test('locationTransform /admin/member/detail/1', () => {
    expect(locationTransform.in({pathname: '/admin/member/detail/1', search: '_={"member":{"listParams":{"pageCurrent":2,"pageCurrent2":3}}}', hash: ''})).toEqual({
      tag: '/admin/member/detail/1',
      params: {
        admin: {},
        member: {
          listParams: {
            pageSize: 10,
            pageCurrent: 2,
            term: undefined,
          },
          listView: '',
          _listVer: 0,
          id: '1',
          itemView: 'detail',
          _itemVer: 0,
        },
      },
    });
  });
  test('in /admin/member/detail/1', () => {
    expect(
      locationTransform.in({
        pathname: '/admin/member/detail/1',
        search: '_={"member":{"listParams":{"pageCurrent":2,"pageCurrent2":3}}}',
        hash: '_={"member":{"_listVer":2,"_itemVer": 3}}',
      })
    ).toEqual({
      tag: '/admin/member/detail/1',
      params: {
        admin: {},
        member: {
          listParams: {
            pageSize: 10,
            pageCurrent: 2,
            term: undefined,
          },
          listView: '',
          _listVer: 2,
          id: '1',
          itemView: 'detail',
          _itemVer: 3,
        },
      },
    });
  });
});

describe('locationTransform', () => {
  test('out /', () => {
    expect(
      locationTransform.out({
        tag: '/',
        params: {
          admin: {},
          member: {
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
        tag: '/admin/member',
        params: {
          admin: {},
          member: {
            listParams: {
              pageSize: 10,
              pageCurrent: 2,
              term: 'aaa',
            },
            listView: '',
            _listVer: 2,
            id: '',
            itemView: '',
            _itemVer: 0,
          },
        },
      })
    ).toEqual({
      pathname: '/admin/member',
      search: '_={"member":{"listParams":{"pageCurrent":2,"term":"aaa"}}}',
      hash: '_={"member":{"_listVer":2}}',
    });
  });
});
