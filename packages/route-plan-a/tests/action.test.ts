import {createWebLocationTransform} from 'src/index';
import {Router, nativeRouter} from './tools';
import nativeRouterMock from './nativeRouter';

describe('actions', () => {
  const photoDefaultParams = {
    _detailKey: '',
    _listKey: '',
    itemId: '',
    listSearch: {
      title: '',
      page: 1,
      pageSize: 10,
    },
  };
  const defaultRouteParams: any = {
    photos: photoDefaultParams,
  };
  const router = new Router(
    {
      pathname: '/',
      search: '',
      hash: '',
    },
    nativeRouter,
    createWebLocationTransform(defaultRouteParams)
  );
  router.setStore({
    dispatch() {
      return undefined;
    },
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('init', async () => {
    expect(router.getRouteState()).toEqual({
      pathname: '/',
      search: '',
      hash: '',
      tag: '/',
      params: {},
      action: 'RELAUNCH',
      key: '1',
    });
    expect(nativeRouterMock.relaunch).toHaveBeenCalledWith({pathname: '/', search: '', hash: ''}, '1');
    expect(router.history.getUriStack()).toEqual({
      actions: ['1|/|{}'],
      groups: ['1|/|{}'],
    });
  });
  test('push /photos/2', async () => {
    await router.push('/photos/2');
    expect(router.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '',
      hash: '',
      tag: '/photos/2',
      params: {},
      action: 'PUSH',
      key: '2',
    });
    expect(nativeRouterMock.push).toHaveBeenCalledWith({pathname: '/photos/2', search: '', hash: ''}, '2');
    expect(router.history.getUriStack()).toEqual({
      actions: ['2|/photos/2|{}', '1|/|{}'],
      groups: ['2|/photos/2|{}', '1|/|{}'],
    });
  });
  test('push /photos/2?_={"photos":{"listSearch":{"page":2}}}', async () => {
    await router.push('/photos/2/?_={"photos":{"listSearch":{"page":2}}}');
    expect(router.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '_={"photos":{"listSearch":{"page":2}}}',
      hash: '',
      tag: '/photos/2',
      params: {photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 2, pageSize: 10}}},
      action: 'PUSH',
      key: '3',
    });
    expect(router.history.getUriStack()).toEqual({
      actions: ['3|/photos/2|{"photos":{"_detailKey":"","_listKey":"","itemId":"","listSearch":{"title":"","page":2,"pageSize":10}}}', '2|/photos/2|{}', '1|/|{}'],
      groups: ['3|/photos/2|{"photos":{"_detailKey":"","_listKey":"","itemId":"","listSearch":{"title":"","page":2,"pageSize":10}}}', '1|/|{}'],
    });
  });
  test('push /photos/2?_={"photos":{"listSearch":{"page":3}}}', async () => {
    await router.push('/photos/2?_={"photos":{"listSearch":{"page":3}}}');
    expect(router.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '_={"photos":{"listSearch":{"page":3}}}',
      hash: '',
      tag: '/photos/2',
      params: {photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 3, pageSize: 10}}},
      action: 'PUSH',
      key: '4',
    });
    expect(router.history.getUriStack()).toEqual({
      actions: [
        '4|/photos/2|{"photos":{"_detailKey":"","_listKey":"","itemId":"","listSearch":{"title":"","page":3,"pageSize":10}}}',
        '3|/photos/2|{"photos":{"_detailKey":"","_listKey":"","itemId":"","listSearch":{"title":"","page":2,"pageSize":10}}}',
        '2|/photos/2|{}',
        '1|/|{}',
      ],
      groups: ['4|/photos/2|{"photos":{"_detailKey":"","_listKey":"","itemId":"","listSearch":{"title":"","page":3,"pageSize":10}}}', '1|/|{}'],
    });
  });
});
