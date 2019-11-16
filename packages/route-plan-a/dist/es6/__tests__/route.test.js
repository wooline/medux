import { fillRouteData } from '../index';
describe('routeToLocation：', () => {
  test('/', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main']
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/',
      search: '?',
      hash: '#'
    });
  });
  test('/?q={"photos":{}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main'],
      stackParams: [{
        photos: {
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/',
      search: '?q={"photos":{}}',
      hash: '#'
    });
  });
  test('/?q={"photos":{"listSearch":{"page":2}}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main'],
      stackParams: [{
        photos: {
          listSearch: {
            title: '',
            page: 2,
            pageSize: 10
          }
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '#'
    });
  });
  test('/photos?q={"photos":{"listSearch":{"page":2}}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.List'],
      stackParams: [{
        photos: {
          listSearch: {
            title: '',
            page: 2,
            pageSize: 10
          }
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '#'
    });
  });
  test('/photos/2', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details'],
      stackParams: [{
        photos: {
          itemId: '2'
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2',
      search: '?',
      hash: '#'
    });
  });
  test('/photos/2?q={"photos":{"listSearch":{"page":2}}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details'],
      stackParams: [{
        photos: {
          listSearch: {
            page: 2
          },
          itemId: '2'
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: '#'
    });
  });
  test('/photos/2/comments', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.List'],
      stackParams: [{
        photos: {
          itemId: '2'
        },
        comments: {
          articleType: 'photos',
          articleId: '2'
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments',
      search: '?',
      hash: '#'
    });
  });
  test('/photos/2/comments?q={"photos":{"listSearch":{"page":2}},"comments":{"listSearch":{"page":3}}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.List'],
      stackParams: [{
        photos: {
          itemId: '2',
          listSearch: {
            page: 2,
            title: ''
          }
        },
        comments: {
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            page: 3
          }
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments',
      search: '?q={"photos":{"listSearch":{"page":2}},"comments":{"listSearch":{"page":3}}}',
      hash: '#'
    });
  });
  test('/photos/2/comments/8', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      stackParams: [{
        photos: {
          itemId: '2'
        },
        comments: {
          articleType: 'photos',
          articleId: '2',
          itemId: '8'
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/8',
      search: '?',
      hash: '#'
    });
  });
  test('/photos/2/comments/8?q=&q={"photos":{"listSearch":{"page":2}}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      stackParams: [{
        photos: {
          itemId: '2'
        },
        comments: {
          articleType: 'photos',
          articleId: '2',
          itemId: '8'
        }
      }, {
        photos: {
          listSearch: {
            page: 2
          }
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/8',
      search: '?q=&q={"photos":{"listSearch":{"page":2}}}',
      hash: '#'
    });
  });
  test('/photos/2/comments/9?q=&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      stackParams: [{
        photos: {
          itemId: '2'
        },
        comments: {
          articleType: 'photos',
          articleId: '2'
        }
      }, {
        photos: {
          listSearch: {
            page: 2
          }
        },
        comments: {
          itemId: '9'
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/9',
      search: '?q=&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}',
      hash: '#'
    });
  });
  test('/photos/2/comments/9?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      stackParams: [{
        photos: {
          itemId: '2',
          listSearch: {
            pageSize: 20
          }
        },
        comments: {
          articleType: 'photos',
          articleId: '2'
        }
      }, {
        photos: {
          listSearch: {
            page: 2
          }
        },
        comments: {
          itemId: '9'
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/9',
      search: '?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}',
      hash: '#'
    });
  });
  test('/photos/2/comments/9/99?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9","listSearch":{"page":99}}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.DetailsList'],
      stackParams: [{
        photos: {
          itemId: '2',
          listSearch: {
            pageSize: 20
          }
        },
        comments: {
          articleType: 'photos',
          articleId: '2'
        }
      }, {
        photos: {
          listSearch: {
            page: 2
          }
        },
        comments: {
          itemId: '9',
          listSearch: {
            page: 99
          }
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/9/99',
      search: '?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9","listSearch":{"page":99}}}',
      hash: '#'
    });
  });
  test('/photos/2/comments/9/99?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.DetailsList'],
      stackParams: [{
        photos: {
          itemId: '2',
          listSearch: {
            pageSize: 20
          }
        },
        comments: {
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            page: 99
          }
        }
      }, {
        photos: {
          listSearch: {
            page: 2
          }
        },
        comments: {
          itemId: '9'
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/9/99',
      search: '?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}',
      hash: '#'
    });
  });
  test('/photos/2/comments/9?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}#q={"photos":{"_listKey":"sdk"}}&q={"comments":{"_listKey":"dba"}}', () => {
    var transformRoute = global['transformRoute'];
    var route = fillRouteData({
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      stackParams: [{
        photos: {
          _listKey: 'sdk',
          itemId: '2',
          listSearch: {
            pageSize: 20
          }
        },
        comments: {
          articleType: 'photos',
          articleId: '2'
        }
      }, {
        photos: {
          listSearch: {
            page: 2
          }
        },
        comments: {
          _listKey: 'dba',
          itemId: '9'
        }
      }]
    });
    var location = transformRoute.routeToLocation(route);
    expect(location).toEqual({
      pathname: '/photos/2/comments/9',
      search: '?q={"photos":{"listSearch":{"pageSize":20}}}&q={"photos":{"listSearch":{"page":2}},"comments":{"itemId":"9"}}',
      hash: '#q={"photos":{"_listKey":"sdk"}}&q={"comments":{"_listKey":"dba"}}'
    });
  });
});
describe('locationToRoute：', () => {
  test('/', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/',
      search: '',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        }
      },
      paths: ['app.Main'],
      params: {
        app: {}
      },
      stackParams: [{
        app: {}
      }]
    });
  });
  test('/?q={"photos":{"listSearch":{"page":2}}}', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/',
      search: '?q={"photos":{"listSearch":{"page":2}}}',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        }
      },
      paths: ['app.Main'],
      params: {
        app: {},
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '',
          listSearch: {
            title: '',
            page: 2,
            pageSize: 10
          }
        }
      },
      stackParams: [{
        app: {},
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '',
          listSearch: {
            title: '',
            page: 2,
            pageSize: 10
          }
        }
      }]
    });
  });
  test('/photos', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos',
      search: '',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          List: true
        }
      },
      paths: ['app.Main', 'photos.List'],
      params: {
        app: {},
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        }
      },
      stackParams: [{
        app: {},
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        }
      }]
    });
  });
  test('/photos/', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/',
      search: '',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          List: true
        }
      },
      paths: ['app.Main', 'photos.List'],
      params: {
        app: {},
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        }
      },
      stackParams: [{
        app: {},
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        }
      }]
    });
  });
  test('/photos/2', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2',
      search: '',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        }
      },
      paths: ['app.Main', 'photos.Details'],
      params: {
        app: {},
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        }
      },
      stackParams: [{
        app: {},
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        }
      }]
    });
  });
  test('/photos/2/comments', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments',
      search: '',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          List: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.List'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      }]
    });
  });
  test('/photos/2/comments/8', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments/8',
      search: '',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          Details: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      }]
    });
  });
  test('/photos/2/comments/8/', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments/8/',
      search: '',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          Details: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      }]
    });
  });
  test('/photos/2/comments/8/99', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments/8/99',
      search: '',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          DetailsList: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.DetailsList'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: '99',
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: '99',
            pageSize: 10
          }
        },
        app: {}
      }]
    });
  });
  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}}}&b=swf', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments/8/',
      search: '?q={"photos":{"listSearch":{"page":3}}}&b=swf',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          Details: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 3,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 3,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      }]
    });
  });
  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments/8/',
      search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          Details: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 3,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: true,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 3,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: true,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      }]
    });
  });
  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments/8/',
      search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf',
      hash: '#q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf'
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          Details: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: 'sdk',
          itemId: '2',
          listSearch: {
            title: '',
            page: 3,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: 'bde',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: true,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: 'sdk',
          itemId: '2',
          listSearch: {
            title: '',
            page: 3,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: 'bde',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: true,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      }]
    });
  });
  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments/8/',
      search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}',
      hash: ''
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          Details: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 4,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: true,
            page: 5,
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 3,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: true,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      }, {
        photos: {
          listSearch: {
            page: 4
          }
        },
        comments: {
          listSearch: {
            page: 5
          }
        }
      }]
    });
  });
  test('/photos/2/comments/8/?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments/8/',
      search: '?q={"photos":{"listSearch":{"page":3}},"comments":{"listSearch":{"isNewest":true}}}&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}',
      hash: '#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf'
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          Details: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: 'sdk',
          itemId: '2',
          listSearch: {
            title: '',
            page: 4,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: 'bde',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: true,
            page: 5,
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 3,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: true,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      }, {
        photos: {
          _listKey: 'sdk',
          listSearch: {
            page: 4
          }
        },
        comments: {
          _listKey: 'bde',
          listSearch: {
            page: 5
          }
        }
      }]
    });
  });
  test('/photos/2/comments/8/?q=&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments/8/',
      search: '?q=&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}',
      hash: '#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf'
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          Details: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.Details'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: 'sdk',
          itemId: '2',
          listSearch: {
            title: '',
            page: 4,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: 'bde',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 5,
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 1,
            pageSize: 10
          }
        },
        app: {}
      }, {
        photos: {
          _listKey: 'sdk',
          listSearch: {
            page: 4
          }
        },
        comments: {
          _listKey: 'bde',
          listSearch: {
            page: 5
          }
        }
      }]
    });
  });
  test('/photos/2/comments/8/99?q=&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf', () => {
    var transformRoute = global['transformRoute'];
    var location = {
      pathname: '/photos/2/comments/8/99',
      search: '?q=&b=swf&q={"photos":{"listSearch":{"page":4}},"comments":{"listSearch":{"page":5}}}',
      hash: '#q=&q={"photos":{"_listKey":"sdk"},"comments":{"_listKey":"bde"}}&b=swf'
    };
    var route = transformRoute.locationToRoute(location);
    expect(route).toEqual({
      views: {
        app: {
          Main: true
        },
        photos: {
          Details: true
        },
        comments: {
          Main: true,
          DetailsList: true
        }
      },
      paths: ['app.Main', 'photos.Details', 'comments.Main', 'comments.DetailsList'],
      params: {
        photos: {
          _detailKey: '',
          _listKey: 'sdk',
          itemId: '2',
          listSearch: {
            title: '',
            page: 4,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: 'bde',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: 5,
            pageSize: 10
          }
        },
        app: {}
      },
      stackParams: [{
        photos: {
          _detailKey: '',
          _listKey: '',
          itemId: '2',
          listSearch: {
            title: '',
            page: 1,
            pageSize: 10
          }
        },
        comments: {
          _detailKey: '',
          _listKey: '',
          itemId: '8',
          articleType: 'photos',
          articleId: '2',
          listSearch: {
            isNewest: false,
            page: '99',
            pageSize: 10
          }
        },
        app: {}
      }, {
        photos: {
          _listKey: 'sdk',
          listSearch: {
            page: 4
          }
        },
        comments: {
          _listKey: 'bde',
          listSearch: {
            page: 5
          }
        }
      }]
    });
  });
});
//# sourceMappingURL=route.test.js.map