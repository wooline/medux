import {TransformRoute, fillRouteData, RouteConfig, buildTransformRoute, setRouteConfig} from '../index';
import {MeduxLocation} from '../utils';

enum ViewNames {
  'appMain' = 'app.Main',
  'photosList' = 'photos.List',
  'photosDetails' = 'photos.Details',
  'commentsMain' = 'comments.Main',
  'commentsList' = 'comments.List',
  'commentsDetails' = 'comments.Details',
  'commentsDetailsList' = 'comments.DetailsList',
}

const routeConfig: RouteConfig = {
  '/': [
    ViewNames.appMain,
    {
      '/photos': ViewNames.photosList,
      '/photos/:itemId': [
        ViewNames.photosDetails,
        {
          '/:articleType/:articleId/comments': [
            ViewNames.commentsMain,
            {
              '/:articleType/:articleId/comments': ViewNames.commentsList,
              '/:articleType/:articleId/comments/:itemId': ViewNames.commentsDetails,
              '/:articleType/:articleId/comments/:itemId/:listSearch.page': ViewNames.commentsDetailsList,
            },
          ],
        },
      ],
    },
  ],
};

interface PhotosRouteParams {
  itemId: string;
  _detailKey: string;
  _listKey: string;
  listSearch: {
    title: string;
    page: number;
    pageSize: number;
  };
}
const photoDefaultParams: PhotosRouteParams = {
  _detailKey: '',
  _listKey: '',
  itemId: '',
  listSearch: {
    title: '',
    page: 1,
    pageSize: 10,
  },
};
interface CommentsRouteParams {
  itemId: string;
  articleType: 'videos' | 'photos';
  articleId: string;
  _detailKey: string;
  _listKey: string;
  //将搜索条件中的articleType和articleId放在path路径中传递
  listSearch: {
    isNewest: boolean;
    page: number;
    pageSize: number;
  };
}

const commentsDefaultParams: CommentsRouteParams = {
  _detailKey: '',
  _listKey: '',
  itemId: '',
  articleType: 'photos',
  articleId: '',
  listSearch: {
    isNewest: false,
    page: 1,
    pageSize: 10,
  },
};
const defaultRouteParams = {
  app: {},
  photos: photoDefaultParams,
  comments: commentsDefaultParams,
};

setRouteConfig({escape: false, defaultRouteParams});

const transformRoute: TransformRoute = buildTransformRoute(routeConfig);

describe('routeToLocation：', () => {
  test('/', () => {
    const route = fillRouteData<{}>({paths: ['app.Main']});
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/',
      search: '?',
      hash: '#',
    });
  });
  test('/?q={"photos":{}}', () => {
    const route = fillRouteData<{}>({paths: ['app.Main'], stackParams: [{photos: {listSearch: {title: '', page: 1, pageSize: 10}}}]});
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/',
      search: '?q={"photos":{}}',
      hash: '#',
    });
  });
  test('/?q={"photos":{"listSearch":{"page":2}}}', () => {
    const route = fillRouteData<{}>({paths: ['app.Main'], stackParams: [{photos: {listSearch: {title: '', page: 2, pageSize: 10}}}]});
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '#',
    });
  });
  test('/photos?q={"photos":{"listSearch":{"page":2}}}', () => {
    const route = fillRouteData<{}>({paths: ['app.Main', 'photos.List'], stackParams: [{photos: {listSearch: {title: '', page: 2, pageSize: 10}}}]});
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '#',
    });
  });
  test('/photos/2', () => {
    const route = fillRouteData<{}>({paths: ['app.Main', 'photos.Details'], stackParams: [{photos: {itemId: '2'}}]});
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2',
      search: '?',
      hash: '#',
    });
  });
  test('/photos/2?q={"photos":{"listSearch":{"page":2}}}', () => {
    const route = fillRouteData<{}>({paths: ['app.Main', 'photos.Details'], stackParams: [{photos: {listSearch: {page: 2}, itemId: '2'}}]});
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '#',
    });
  });
  test('/photos/2/comments', () => {
    const route = fillRouteData<{}>({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.List'],
      stackParams: [{photos: {itemId: '2'}, comments: {articleType: 'photos', articleId: '2'}}],
    });
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments',
      search: '?',
      hash: '#',
    });
  });
  test('/photos/2/comments?q={"photos":{"listSearch":{"page":2}},"comments":{"listSearch":{"page":3}}}', () => {
    const route = fillRouteData<{}>({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.List'],
      stackParams: [{photos: {itemId: '2', listSearch: {page: 2, title: ''}}, comments: {articleType: 'photos', articleId: '2', listSearch: {page: 3}}}],
    });
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments',
      search: '?q={"photos":{"listSearch":{"page":2}},"comments":{"listSearch":{"page":3}}}',
      hash: '#',
    });
  });
  test('/photos/2/comments/8', () => {
    const route = fillRouteData<{}>({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      stackParams: [{photos: {itemId: '2'}, comments: {articleType: 'photos', articleId: '2', itemId: '8'}}],
    });
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/8',
      search: '?',
      hash: '#',
    });
  });
  test('/photos/2/comments/8?q=&q={"photos":{"listSearch":{"page":2}}}', () => {
    const route = fillRouteData<{}>({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      stackParams: [{photos: {itemId: '2'}, comments: {articleType: 'photos', articleId: '2', itemId: '8'}}, {photos: {listSearch: {page: 2}}}],
    });
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/8',
      search: '?q=&q={"photos":{"listSearch":{"page":2}}}',
      hash: '#',
    });
  });
  test('/photos/2/comments/9?q=&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}', () => {
    const route = fillRouteData<{}>({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      stackParams: [
        {photos: {itemId: '2'}, comments: {articleType: 'photos', articleId: '2'}},
        {photos: {listSearch: {page: 2}}, comments: {itemId: '9'}},
      ],
    });
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/9',
      search: '?q=&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}',
      hash: '#',
    });
  });
  test('/photos/2/comments/9?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}', () => {
    const route = fillRouteData<{}>({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      stackParams: [
        {photos: {itemId: '2', listSearch: {pageSize: 20}}, comments: {articleType: 'photos', articleId: '2'}},
        {photos: {listSearch: {page: 2}}, comments: {itemId: '9'}},
      ],
    });
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/9',
      search: '?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}',
      hash: '#',
    });
  });
  test('/photos/2/comments/9/99?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9","listSearch":{"page":99}}}', () => {
    const route = fillRouteData<{}>({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.DetailsList'],
      stackParams: [
        {photos: {itemId: '2', listSearch: {pageSize: 20}}, comments: {articleType: 'photos', articleId: '2'}},
        {photos: {listSearch: {page: 2}}, comments: {itemId: '9', listSearch: {page: 99}}},
      ],
    });
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/9/99',
      search: '?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9","listSearch":{"page":99}}}',
      hash: '#',
    });
  });

  test('/photos/2/comments/9/99?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}', () => {
    const route = fillRouteData<{}>({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.DetailsList'],
      stackParams: [
        {photos: {itemId: '2', listSearch: {pageSize: 20}}, comments: {articleType: 'photos', articleId: '2', listSearch: {page: 99}}},
        {photos: {listSearch: {page: 2}}, comments: {itemId: '9'}},
      ],
    });
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/9/99',
      search: '?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}',
      hash: '#',
    });
  });

  test('/photos/2/comments/9?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}#q={"photos":{"_listKey":"sdk"}}&q={"comments":{"_listKey":"dba"}}', () => {
    const route = fillRouteData<{}>({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      stackParams: [
        {photos: {_listKey: 'sdk', itemId: '2', listSearch: {pageSize: 20}}, comments: {articleType: 'photos', articleId: '2'}},
        {photos: {listSearch: {page: 2}}, comments: {_listKey: 'dba', itemId: '9'}},
      ],
    });
    const location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/9',
      search: '?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}',
      hash: '#q={"photos":{"_listKey":"sdk"}}&q={"comments":{"_listKey":"dba"}}',
    });
  });
});

describe('locationToRoute：', () => {
  test('/', () => {
    const location: MeduxLocation = {pathname: '/', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}},
      paths: ['app.Main'],
      params: {app: {}},
      stackParams: [{app: {}}],
    });
  });
  test('/?q={"photos":{"listSearch":{"page":2}}}', () => {
    const location: MeduxLocation = {pathname: '/', search: '?q={"photos":{"listSearch":{"page":2}}}', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}},
      paths: ['app.Main'],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 2, pageSize: 10}}},
      stackParams: [{app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 2, pageSize: 10}}}],
    });
  });
  test('/photos', () => {
    const location: MeduxLocation = {pathname: '/photos', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {List: true}},
      paths: ['app.Main', 'photos.List'],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}},
      stackParams: [{app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}}],
    });
  });

  test('/photos/', () => {
    const location: MeduxLocation = {pathname: '/photos/', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {List: true}},
      paths: ['app.Main', 'photos.List'],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}},
      stackParams: [{app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}}],
    });
  });

  test('/photos/2', () => {
    const location: MeduxLocation = {pathname: '/photos/2', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}},
      paths: ['app.Main', 'photos.Details'],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}}},
      stackParams: [{app: {}, photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}}}],
    });
  });

  test('/photos/2/comments', () => {
    const location: MeduxLocation = {pathname: '/photos/2/comments', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, List: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.List'],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
          comments: {_detailKey: '', _listKey: '', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
          app: {},
        },
      ],
    });
  });

  test('/photos/2/comments#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}', () => {
    const location: MeduxLocation = {pathname: '/photos/2/comments', search: '', hash: '#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}'};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, List: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.List'],
      params: {
        photos: {_detailKey: '', _listKey: 'sdk', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: 'bde', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: 'sdk', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
          comments: {_detailKey: '', _listKey: 'bde', itemId: '', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
          app: {},
        },
      ],
    });
  });

  test('/photos/2/comments/8', () => {
    const location: MeduxLocation = {pathname: '/photos/2/comments/8', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
          comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
          app: {},
        },
      ],
    });
  });
  test('/photos/2/comments/8/', () => {
    const location: MeduxLocation = {pathname: '/photos/2/comments/8/', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
          comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
          app: {},
        },
      ],
    });
  });
  test('/photos/2/comments/8/99', () => {
    const location: MeduxLocation = {pathname: '/photos/2/comments/8/99', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, DetailsList: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.DetailsList'],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: '99', pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
          comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: '99', pageSize: 10}},
          app: {},
        },
      ],
    });
  });
  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}}}&b=swf', () => {
    const location: MeduxLocation = {pathname: '/photos/2/comments/8/', search: '?q={"photos":{"listSearch":{"page":3}}}&b=swf', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
          comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
          app: {},
        },
      ],
    });
  });

  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf', () => {
    const location: MeduxLocation = {pathname: '/photos/2/comments/8/', search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: true, page: 1, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
          comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: true, page: 1, pageSize: 10}},
          app: {},
        },
      ],
    });
  });

  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}', () => {
    const location: MeduxLocation = {
      pathname: '/photos/2/comments/8/',
      search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf',
      hash: '#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf',
    };
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {_detailKey: '', _listKey: 'sdk', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
        comments: {_detailKey: '', _listKey: 'bde', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: true, page: 1, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: 'sdk', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
          comments: {_detailKey: '', _listKey: 'bde', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: true, page: 1, pageSize: 10}},
          app: {},
        },
      ],
    });
  });

  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}', () => {
    const location: MeduxLocation = {
      pathname: '/photos/2/comments/8/',
      search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}',
      hash: '',
    };
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 4, pageSize: 10}},
        comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: true, page: 5, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
          comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: true, page: 1, pageSize: 10}},
          app: {},
        },
        {photos: {listSearch: {page: 4}}, comments: {listSearch: {page: 5}}},
      ],
    });
  });

  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf', () => {
    const location: MeduxLocation = {
      pathname: '/photos/2/comments/8/',
      search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}',
      hash: '#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf',
    };
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {_detailKey: '', _listKey: 'sdk', itemId: '2', listSearch: {title: '', page: 4, pageSize: 10}},
        comments: {_detailKey: '', _listKey: 'bde', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: true, page: 5, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 3, pageSize: 10}},
          comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: true, page: 1, pageSize: 10}},
          app: {},
        },
        {photos: {_listKey: 'sdk', listSearch: {page: 4}}, comments: {_listKey: 'bde', listSearch: {page: 5}}},
      ],
    });
  });

  test('/photos/2/comments/8/?q=&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf', () => {
    const location: MeduxLocation = {
      pathname: '/photos/2/comments/8/',
      search: '?q=&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}',
      hash: '#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf',
    };
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, Details: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {_detailKey: '', _listKey: 'sdk', itemId: '2', listSearch: {title: '', page: 4, pageSize: 10}},
        comments: {_detailKey: '', _listKey: 'bde', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 5, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
          comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 1, pageSize: 10}},
          app: {},
        },
        {photos: {_listKey: 'sdk', listSearch: {page: 4}}, comments: {_listKey: 'bde', listSearch: {page: 5}}},
      ],
    });
  });

  test('/photos/2/comments/8/99?q=&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf', () => {
    const location: MeduxLocation = {
      pathname: '/photos/2/comments/8/99',
      search: '?q=&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}',
      hash: '#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf',
    };
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}, comments: {Main: true, DetailsList: true}},
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.DetailsList'],
      params: {
        photos: {_detailKey: '', _listKey: 'sdk', itemId: '2', listSearch: {title: '', page: 4, pageSize: 10}},
        comments: {_detailKey: '', _listKey: 'bde', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: 5, pageSize: 10}},
        app: {},
      },
      stackParams: [
        {
          photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
          comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: '99', pageSize: 10}},
          app: {},
        },
        {photos: {_listKey: 'sdk', listSearch: {page: 4}}, comments: {_listKey: 'bde', listSearch: {page: 5}}},
      ],
    });
  });
});
