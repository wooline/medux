import {historyActions, ViewNames} from './tools';

describe('history', () => {
  test('init', async () => {
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos',
      search: '',
      hash: '',
      views: {app: {Main: true}, photos: {List: true}},
      paths: [ViewNames.appMain, ViewNames.photosList],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}},
      action: 'RELAUNCH',
      url: '/photos',
      key: '1',
      history: ['1|/photos'],
      stack: ['1|/photos'],
    });
  });
  test('push /photos/2', async () => {
    await historyActions.push({pathname: '/photos/2', search: '', hash: ''});
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '',
      hash: '',
      views: {app: {Main: true}, photos: {Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}}},
      action: 'PUSH',
      url: '/photos/2',
      key: '2',
      history: ['2|/photos/2', '1|/photos'],
      stack: ['2|/photos/2', '1|/photos'],
    });
  });
  test('push /photos/2?q={"photos":{"listSearch":{"page":2}}}', async () => {
    await historyActions.push({pathname: '/photos/2/', search: 'q={"photos":{"listSearch":{"page":2}}}', hash: ''});
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '',
      views: {app: {Main: true}, photos: {Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 2, pageSize: 10}}},
      action: 'PUSH',
      url: '/photos/2?q={"photos":{"listSearch":{"page":2}}}',
      key: '3',
      history: ['3|/photos/2?q={"photos":{"listSearch":{"page":2}}}', '2|/photos/2', '1|/photos'],
      stack: ['3|/photos/2?q={"photos":{"listSearch":{"page":2}}}', '1|/photos'],
    });
  });
  test('push /photos/2?q={"photos":{"listSearch":{"page":3}}}', async () => {
    await historyActions.push({pathname: '/photos/2', search: 'q={"photos":{"listSearch":{"page":3}}}', hash: ''});
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '?q={"photos":{"listSearch":{"page":3}}}',
      hash: '',
      views: {app: {Main: true}, photos: {Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}}},
      action: 'PUSH',
      url: '/photos/2?q={"photos":{"listSearch":{"page":3}}}',
      key: '4',
      history: ['4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '3|/photos/2?q={"photos":{"listSearch":{"page":2}}}', '2|/photos/2', '1|/photos'],
      stack: ['4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '1|/photos'],
    });
  });
  test('push /photos/2/comments', async () => {
    await historyActions.push({pathname: '/photos/2/comments/', search: '', hash: ''});
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2/comments',
      search: '',
      hash: '',
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, List: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsList],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
      action: 'PUSH',
      url: '/photos/2/comments',
      key: '5',
      history: ['5|/photos/2/comments', '4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '3|/photos/2?q={"photos":{"listSearch":{"page":2}}}', '2|/photos/2', '1|/photos'],
      stack: ['5|/photos/2/comments', '4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '1|/photos'],
    });
  });
  test('push /', async () => {
    await historyActions.push({pathname: '/', search: '', hash: ''});
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos',
      search: '',
      hash: '',
      views: {app: {Main: true}, photos: {List: true}},
      paths: [ViewNames.appMain, ViewNames.photosList],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}},
      action: 'PUSH',
      url: '/photos',
      key: '6',
      history: ['6|/photos', '5|/photos/2/comments', '4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '3|/photos/2?q={"photos":{"listSearch":{"page":2}}}', '2|/photos/2', '1|/photos'],
      stack: ['6|/photos', '5|/photos/2/comments', '4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '1|/photos'],
    });
  });
  test('replace /photos/2/comments', async () => {
    await historyActions.replace({pathname: '/photos/2/comments', search: '', hash: ''});
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2/comments',
      search: '',
      hash: '',
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, List: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsList],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
      action: 'REPLACE',
      url: '/photos/2/comments',
      key: '7',
      history: ['7|/photos/2/comments', '5|/photos/2/comments', '4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '3|/photos/2?q={"photos":{"listSearch":{"page":2}}}', '2|/photos/2', '1|/photos'],
      stack: ['7|/photos/2/comments', '4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '1|/photos'],
    });
  });
  test('replace /photos/2/comments#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}', async () => {
    await historyActions.replace({pathname: '/photos/2/comments', search: '', hash: 'q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}'});
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2/comments',
      search: '',
      hash: '#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}',
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, List: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsList],
      params: {
        photos: {_detailKey: '', _listKey: 'sdk', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: 'bde', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
      action: 'REPLACE',
      url: '/photos/2/comments#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}',
      key: '8',
      history: [
        '8|/photos/2/comments#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}',
        '5|/photos/2/comments',
        '4|/photos/2?q={"photos":{"listSearch":{"page":3}}}',
        '3|/photos/2?q={"photos":{"listSearch":{"page":2}}}',
        '2|/photos/2',
        '1|/photos',
      ],
      stack: ['8|/photos/2/comments#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}', '4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '1|/photos'],
    });
  });
  test('pop 1', async () => {
    await historyActions.pop();
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2/comments',
      search: '',
      hash: '',
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, List: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsList],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
      action: 'POP1',
      url: '/photos/2/comments',
      key: '5',
      history: ['5|/photos/2/comments', '4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '3|/photos/2?q={"photos":{"listSearch":{"page":2}}}', '2|/photos/2', '1|/photos'],
      stack: ['5|/photos/2/comments', '4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '1|/photos'],
    });
  });
  test('pop 1', async () => {
    await historyActions.pop();
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '?q={"photos":{"listSearch":{"page":3}}}',
      hash: '',
      views: {app: {Main: true}, photos: {Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}}},
      action: 'POP1',
      url: '/photos/2?q={"photos":{"listSearch":{"page":3}}}',
      key: '4',
      history: ['4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '3|/photos/2?q={"photos":{"listSearch":{"page":2}}}', '2|/photos/2', '1|/photos'],
      stack: ['4|/photos/2?q={"photos":{"listSearch":{"page":3}}}', '1|/photos'],
    });
  });
  test('pop 2', async () => {
    await historyActions.pop(2);
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2',
      search: '',
      hash: '',
      views: {app: {Main: true}, photos: {Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}}},
      action: 'POP2',
      url: '/photos/2',
      key: '2',
      history: ['2|/photos/2', '1|/photos'],
      stack: ['2|/photos/2', '1|/photos'],
    });
  });
  test('push /photos/2/comments', async () => {
    await historyActions.push({pathname: '/photos/2/comments/', search: '', hash: ''});
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos/2/comments',
      search: '',
      hash: '',
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, List: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsList],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
      action: 'PUSH',
      url: '/photos/2/comments',
      key: '9',
      history: ['9|/photos/2/comments', '2|/photos/2', '1|/photos'],
      stack: ['9|/photos/2/comments', '2|/photos/2', '1|/photos'],
    });
  });
  test('pop 10', async () => {
    await historyActions.pop(10);
    expect(historyActions.getRouteState()).toEqual({
      pathname: '/photos',
      search: '',
      hash: '',
      views: {app: {Main: true}, photos: {List: true}},
      paths: [ViewNames.appMain, ViewNames.photosList],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}},
      action: 'RELAUNCH',
      url: '/photos',
      key: '10',
      history: ['10|/photos'],
      stack: ['10|/photos'],
    });
  });
});
