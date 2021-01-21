import {createWebLocationTransform} from 'src/index';
import {HistoryActions, nativeHistory} from './tools';
import nativeHistoryMock from './nativeHistory';

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
  const historyActions = new HistoryActions(nativeHistory, createWebLocationTransform(defaultRouteParams));
  historyActions.setStore({
    dispatch() {
      return undefined;
    },
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('init', async () => {
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/',
      search: '',
      hash: '',
      tag: '/',
      params: {},
      action: 'RELAUNCH',
      key: '1',
      history: ['1|/|{}'],
      stack: ['1|/|{}'],
    });
    expect(nativeHistoryMock.relaunch).toHaveBeenCalledWith({pathname: '/', search: '', hash: ''}, '1');
  });
  test('push /photos/2', async () => {
    await historyActions.push('/photos/2');
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '',
      hash: '',
      tag: '/photos/2',
      params: {},
      action: 'PUSH',
      key: '2',
      history: ['2|/photos/2|{}', '1|/|{}'],
      stack: ['2|/photos/2|{}', '1|/|{}'],
    });
    expect(nativeHistoryMock.push).toHaveBeenCalledWith({pathname: '/photos/2', search: '', hash: ''}, '2');
  });
  test('push /photos/2?_={"photos":{"listSearch":{"page":2}}}', async () => {
    await historyActions.push('/photos/2/?_={"photos":{"listSearch":{"page":2}}}');
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '_={"photos":{"listSearch":{"page":2}}}',
      hash: '',
      tag: '/photos/2',
      params: {photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 2, pageSize: 10}}},
      action: 'PUSH',
      key: '3',
      history: ['3|/photos/2|{"photos":{"_detailKey":"","_listKey":"","itemId":"","listSearch":{"title":"","page":2,"pageSize":10}}}', '2|/photos/2|{}', '1|/|{}'],
      stack: ['3|/photos/2|{"photos":{"_detailKey":"","_listKey":"","itemId":"","listSearch":{"title":"","page":2,"pageSize":10}}}', '1|/|{}'],
    });
  });
  test('push /photos/2?_={"photos":{"listSearch":{"page":3}}}', async () => {
    await historyActions.push('/photos/2?_={"photos":{"listSearch":{"page":3}}}');
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '_={"photos":{"listSearch":{"page":3}}}',
      hash: '',
      tag: '/photos/2',
      params: {photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 3, pageSize: 10}}},
      action: 'PUSH',
      key: '4',
      history: [
        '4|/photos/2|{"photos":{"_detailKey":"","_listKey":"","itemId":"","listSearch":{"title":"","page":3,"pageSize":10}}}',
        '3|/photos/2|{"photos":{"_detailKey":"","_listKey":"","itemId":"","listSearch":{"title":"","page":2,"pageSize":10}}}',
        '2|/photos/2|{}',
        '1|/|{}',
      ],
      stack: ['4|/photos/2|{"photos":{"_detailKey":"","_listKey":"","itemId":"","listSearch":{"title":"","page":3,"pageSize":10}}}', '1|/|{}'],
    });
  });
});
