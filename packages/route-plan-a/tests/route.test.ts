import {MeduxLocation, RouteConfig, TransformRoute, buildTransformRoute, setRouteConfig} from 'src/index';

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
  // 将搜索条件中的articleType和articleId放在path路径中传递
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

const transformRoute: TransformRoute = buildTransformRoute(routeConfig, () => '/aa/bb/cc');

describe('routeToLocation：', () => {
  test('/', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain]);
    expect(location).toEqual({
      pathname: '/',
      search: '',
      hash: '',
    });
  });
  test('/?q={"photos":{}}', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain], {photos: {listSearch: {title: '', page: 1, pageSize: 10}}});
    expect(location).toEqual({
      pathname: '/',
      search: '?q={"photos":{}}',
      hash: '',
    });
  });
  test('/?q={"photos":{"listSearch":{"page":2}}}', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain], {photos: {listSearch: {title: '', page: 2, pageSize: 10}}}, 'push');
    expect(location).toEqual({
      pathname: '/',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '',
      action: 'push',
    });
  });
  test('/photos?q={"photos":{"listSearch":{"page":2}}}', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain, ViewNames.photosList], {photos: {listSearch: {title: '', page: 2, pageSize: 10}}});
    expect(location).toEqual({
      pathname: '/photos',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '',
    });
  });
  test('/photos/2', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain, ViewNames.photosDetails], {photos: {itemId: '2'}});
    expect(location).toEqual({
      pathname: '/photos/2',
      search: '',
      hash: '',
    });
  });
  test('/photos/2?q={"photos":{"listSearch":{"page":2}}}', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain, ViewNames.photosDetails], {photos: {listSearch: {page: 2}, itemId: '2'}});
    expect(location).toEqual({
      pathname: '/photos/2',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '',
    });
  });
  test('/photos/2/comments', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsList], {
      photos: {itemId: '2'},
      comments: {articleType: 'photos', articleId: '2'},
    });
    expect(location).toEqual({
      pathname: '/photos/2/comments',
      search: '',
      hash: '',
    });
  });
  test('/photos/2/comments?q={"photos":{"listSearch":{"page":2}},"comments":{"listSearch":{"page":3}}}', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsList], {
      photos: {itemId: '2', listSearch: {page: 2, title: ''}},
      comments: {articleType: 'photos', articleId: '2', listSearch: {page: 3}},
    });
    expect(location).toEqual({
      pathname: '/photos/2/comments',
      search: '?q={"photos":{"listSearch":{"page":2}},"comments":{"listSearch":{"page":3}}}',
      hash: '',
    });
  });
  test('/photos/2/comments/8', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsDetails], {
      photos: {itemId: '2'},
      comments: {articleType: 'photos', articleId: '2', itemId: '8'},
    });
    expect(location).toEqual({
      pathname: '/photos/2/comments/8',
      search: '',
      hash: '',
    });
  });
  test('/photos/2/comments/9?q={"photos":{"listSearch":{"pageSize":2}}}#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"dba"}}', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsDetails], {
      photos: {_listKey: 'sdk', itemId: '2', listSearch: {pageSize: 2}},
      comments: {_listKey: 'dba', articleType: 'photos', articleId: '2', itemId: '9'},
    });
    expect(location).toEqual({
      pathname: '/photos/2/comments/9',
      search: '?q={"photos":{"listSearch":{"pageSize":2}}}',
      hash: '#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"dba"}}',
    });
  });
  test('/photos/2/comments/8/99', () => {
    const location = transformRoute.routeToLocation([ViewNames.appMain, ViewNames.photosDetails, ViewNames.commentsMain, ViewNames.commentsDetailsList], {
      app: {},
      photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}},
      comments: {_detailKey: '', _listKey: '', itemId: '8', articleType: 'photos', articleId: '2', listSearch: {isNewest: false, page: '99', pageSize: 10}},
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
    const location: MeduxLocation = {pathname: '/', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}},
      paths: [ViewNames.appMain],
      params: {app: {}},
    });
  });
  test('/?q={"photos":{"listSearch":{"page":2}}}', () => {
    const location: MeduxLocation = {pathname: '/', search: '?q={"photos":{"listSearch":{"page":2}}}', hash: '', action: 'push'};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}},
      paths: [ViewNames.appMain],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 2, pageSize: 10}}},
      action: 'push',
    });
  });
  test('/photos', () => {
    const location: MeduxLocation = {pathname: '/photos', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {List: true}},
      paths: [ViewNames.appMain, ViewNames.photosList],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}},
    });
  });

  test('/photos/', () => {
    const location: MeduxLocation = {pathname: '/photos/', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {List: true}},
      paths: [ViewNames.appMain, ViewNames.photosList],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '', listSearch: {title: '', page: 1, pageSize: 10}}},
    });
  });

  test('/photos/2', () => {
    const location: MeduxLocation = {pathname: '/photos/2', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {app: {Main: true}, photos: {Details: true}},
      paths: [ViewNames.appMain, ViewNames.photosDetails],
      params: {app: {}, photos: {_detailKey: '', _listKey: '', itemId: '2', listSearch: {title: '', page: 1, pageSize: 10}}},
    });
  });

  test('/photos/2/comments', () => {
    const location: MeduxLocation = {pathname: '/photos/2/comments', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
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
    const location: MeduxLocation = {pathname: '/photos/2/comments', search: '', hash: '#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}'};
    const route = transformRoute.locationToRoute(location);
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
    const location: MeduxLocation = {pathname: '/photos/2/comments/8', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
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
    const location: MeduxLocation = {pathname: '/photos/2/comments/8/', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
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
    const location: MeduxLocation = {pathname: '/photos/2/comments/8/99', search: '', hash: ''};
    const route = transformRoute.locationToRoute(location);
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
    const location: MeduxLocation = {pathname: '/photos/2/comments/8/', search: '?q={"photos":{"listSearch":{"page":3}}}&b=swf', hash: ''};
    const route = transformRoute.locationToRoute(location);
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
    const location: MeduxLocation = {pathname: '/photos/2/comments/8/', search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf', hash: ''};
    const route = transformRoute.locationToRoute(location);
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
    const location: MeduxLocation = {
      pathname: '/photos/2/comments/8/',
      search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf',
      hash: '#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf',
    };
    const route = transformRoute.locationToRoute(location);
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
