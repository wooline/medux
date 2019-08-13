import {RouteConfig, buildTransformRoute, setConfig} from '../index';

enum ViewNames {
  'appMain' = 'app.Main',
  'photosList' = 'photos.List',
  'photosDetails' = 'photos.Details',
  'commentsMain' = 'comments.Main',
  'commentsList' = 'comments.List',
  'commentsDetails' = 'comments.Details',
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
            },
          ],
        },
      ],
    },
  ],
};

export interface PhotosRouteParams {
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
export interface CommentsRouteParams {
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

setConfig({escape: false, defaultRouteParams});

global['transformRoute'] = buildTransformRoute(routeConfig);
