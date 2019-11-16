import { buildTransformRoute, setRouteConfig } from '../index';
var ViewNames;

(function (ViewNames) {
  ViewNames["appMain"] = "app.Main";
  ViewNames["photosList"] = "photos.List";
  ViewNames["photosDetails"] = "photos.Details";
  ViewNames["commentsMain"] = "comments.Main";
  ViewNames["commentsList"] = "comments.List";
  ViewNames["commentsDetails"] = "comments.Details";
  ViewNames["commentsDetailsList"] = "comments.DetailsList";
})(ViewNames || (ViewNames = {}));

var routeConfig = {
  '/': [ViewNames.appMain, {
    '/photos': ViewNames.photosList,
    '/photos/:itemId': [ViewNames.photosDetails, {
      '/:articleType/:articleId/comments': [ViewNames.commentsMain, {
        '/:articleType/:articleId/comments': ViewNames.commentsList,
        '/:articleType/:articleId/comments/:itemId': ViewNames.commentsDetails,
        '/:articleType/:articleId/comments/:itemId/:listSearch.page': ViewNames.commentsDetailsList
      }]
    }]
  }]
};
var photoDefaultParams = {
  _detailKey: '',
  _listKey: '',
  itemId: '',
  listSearch: {
    title: '',
    page: 1,
    pageSize: 10
  }
};
var commentsDefaultParams = {
  _detailKey: '',
  _listKey: '',
  itemId: '',
  articleType: 'photos',
  articleId: '',
  listSearch: {
    isNewest: false,
    page: 1,
    pageSize: 10
  }
};
var defaultRouteParams = {
  app: {},
  photos: photoDefaultParams,
  comments: commentsDefaultParams
};
setRouteConfig({
  escape: false,
  defaultRouteParams
});
global['transformRoute'] = buildTransformRoute(routeConfig);
//# sourceMappingURL=setup.js.map