import {historyActions, ViewNames} from './tools';

describe('routeToLocation：', () => {
  test('/', () => {
    const location = historyActions.payloadToLocation({viewName: ViewNames.appMain});
    expect(location).toEqual({
      pathname: '/',
      search: '',
      hash: '',
    });
  });
  test('/?q={"photos":{}}', () => {
    const location = historyActions.payloadToLocation({viewName: ViewNames.appMain, params: {photos: {listSearch: {title: '', page: 1, pageSize: 10}}}});
    expect(location).toEqual({
      pathname: '/',
      search: '?q={"photos":{}}',
      hash: '',
    });
  });
  test('/?q={"photos":{"listSearch":{"page":2}}}', () => {
    const location = historyActions.payloadToLocation({viewName: ViewNames.appMain, params: {photos: {listSearch: {title: '', page: 2, pageSize: 10}}}});
    expect(location).toEqual({
      pathname: '/',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '',
    });
  });
  test('/photos?q={"photos":{"listSearch":{"page":2}}}', () => {
    const location = historyActions.payloadToLocation({viewName: ViewNames.photosList, params: {photos: {listSearch: {title: '', page: 2, pageSize: 10}}}});
    expect(location).toEqual({
      pathname: '/photos',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '',
    });
  });
  test('/photos/2', () => {
    const location = historyActions.payloadToLocation({viewName: ViewNames.photosDetails, params: {photos: {itemId: '2'}}});
    expect(location).toEqual({
      pathname: '/photos/2',
      search: '',
      hash: '',
    });
  });
  test('/photos/2?q={"photos":{"listSearch":{"page":2}}}', () => {
    const location = historyActions.payloadToLocation({viewName: ViewNames.photosDetails, params: {photos: {listSearch: {page: 2}, itemId: '2'}}});
    expect(location).toEqual({
      pathname: '/photos/2',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '',
    });
  });
  test('/photos/2/comments', () => {
    const location = historyActions.payloadToLocation({
      viewName: ViewNames.commentsList,
      params: {
        photos: {itemId: '2'},
        comments: {articleType: 'photos', articleId: '2'},
      },
    });
    expect(location).toEqual({
      pathname: '/photos/2/comments',
      search: '',
      hash: '',
    });
  });
  test('/photos/2/comments?q={"photos":{"listSearch":{"page":2}},"comments":{"listSearch":{"page":3}}}', () => {
    const location = historyActions.payloadToLocation({
      viewName: ViewNames.commentsList,
      params: {
        photos: {itemId: '2', listSearch: {page: 2, title: ''}},
        comments: {articleType: 'photos', articleId: '2', listSearch: {page: 3}},
      },
    });
    expect(location).toEqual({
      pathname: '/photos/2/comments',
      search: '?q={"photos":{"listSearch":{"page":2}},"comments":{"listSearch":{"page":3}}}',
      hash: '',
    });
  });
  test('/photos/2/comments/8', () => {
    const location = historyActions.payloadToLocation({
      viewName: ViewNames.commentsDetails,
      params: {
        photos: {itemId: '2'},
        comments: {articleType: 'photos', articleId: '2', itemId: '8'},
      },
    });
    expect(location).toEqual({
      pathname: '/photos/2/comments/8',
      search: '',
      hash: '',
    });
  });
  test('/photos/2/comments/9?q={"photos":{"listSearch":{"pageSize":2}}}#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"dba"}}', () => {
    const location = historyActions.payloadToLocation({
      viewName: ViewNames.commentsDetails,
      params: {
        photos: {_listKey: 'sdk', itemId: '2', listSearch: {pageSize: 2}},
        comments: {_listKey: 'dba', articleType: 'photos', articleId: '2', itemId: '9'},
      },
    });
    expect(location).toEqual({
      pathname: '/photos/2/comments/9',
      search: '?q={"photos":{"listSearch":{"pageSize":2}}}',
      hash: '#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"dba"}}',
    });
  });
  test('/photos/2/comments/8/99', () => {
    const location = historyActions.payloadToLocation({
      viewName: ViewNames.commentsDetailsList,
      params: {
        app: {},
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 99, pageSize: 10}},
      },
    });
    expect(location).toEqual({
      pathname: '/photos/2/comments/8/99',
      search: '',
      hash: '',
    });
  });
});

describe('locationToRoute：', () => {
  test('/', () => {
    const location = {pathname: '/', search: '', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {'@': {'/photos': true}},
      paths: ['@./photos'],
      params: {'@': undefined},
    });
  });
  test('/?q={"photos":{"listSearch":{"page":2}}}', () => {
    const location = {pathname: '/', search: '?q={"photos":{"listSearch":{"page":2}}}', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {'@': {'/photos': true}},
      paths: ['@./photos'],
      params: {'@': undefined, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 2, pageSize: 10}}},
    });
  });
  test('/photos', () => {
    const location = {pathname: '/photos', search: '', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {List: true}},
      paths: [ViewNames.appMain, ViewNames.photosList],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}},
    });
  });

  test('/photos/', () => {
    const location = {pathname: '/photos/', search: '', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {List: true}},
      paths: [ViewNames.appMain, ViewNames.photosList],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}},
    });
  });

  test('/photos/2', () => {
    const location = {pathname: '/photos/2', search: '', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}}},
    });
  });

  test('/photos/2/comments', () => {
    const location = {pathname: '/photos/2/comments', search: '', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, List: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsList],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
    });
  });

  test('/photos/2/comments#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}', () => {
    const location = {pathname: '/photos/2/comments', search: '', hash: '#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}'};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, List: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsList],
      params: {
        photos: {_detailKey: '', _listKey: 'sdk', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: 'bde', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
    });
  });

  test('/photos/2/comments/8', () => {
    const location = {pathname: '/photos/2/comments/8', search: '', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsDetails],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
    });
  });
  test('/photos/2/comments/8/', () => {
    const location = {pathname: '/photos/2/comments/8/', search: '', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsDetails],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
    });
  });
  test('/photos/2/comments/8/99', () => {
    const location = {pathname: '/photos/2/comments/8/99', search: '', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, DetailsList: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsDetailsList],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: '99', pageSize: 10}},
        app: {},
      },
    });
  });
  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}}}&b=swf', () => {
    const location = {pathname: '/photos/2/comments/8/', search: '?q={"photos":{"listSearch":{"page":3}}}&b=swf', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsDetails],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
    });
  });

  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf', () => {
    const location = {pathname: '/photos/2/comments/8/', search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf', hash: ''};
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsDetails],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: true, page: 1, pageSize: 10}},
        app: {},
      },
    });
  });

  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}', () => {
    const location = {
      pathname: '/photos/2/comments/8/',
      search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf',
      hash: '#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf',
    };
    const route = historyActions.payloadToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsDetails],
      params: {
        photos: {_detailKey: '', _listKey: 'sdk', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
        comments: {_detailKey: '', _listKey: 'bde', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: true, page: 1, pageSize: 10}},
        app: {},
      },
    });
  });
});
