import {RouteRule, BaseHistoryActions, setRouteConfig} from 'src/index';

export class HistoryActions extends BaseHistoryActions<RouteParams> {
  destroy() {}
}
export const nativeHistory: any = {};

export enum ViewNames {
  'appMain' = 'app.Main',
  'photosList' = 'photos.List',
  'photosDetails' = 'photos.Details',
  'commentsMain' = 'comments.Main',
  'commentsList' = 'comments.List',
  'commentsDetails' = 'comments.Details',
  'commentsDetailsList' = 'comments.DetailsList',
}

export const routeRule: RouteRule = {
  '/$': '@./photos',
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
export const photoDefaultParams: PhotosRouteParams = {
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
  // 将搜索条件中的articleType和articleId放在path路径中传递
  listSearch: {
    isNewest: boolean;
    page: number;
    pageSize: number;
  };
}

export const commentsDefaultParams: CommentsRouteParams = {
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
export const defaultRouteParams = {
  app: {},
  photos: photoDefaultParams,
  comments: commentsDefaultParams,
};

type RouteParams = typeof defaultRouteParams;

setRouteConfig({escape: false});

export const historyActions = new HistoryActions(nativeHistory, defaultRouteParams, '/', routeRule);
historyActions.setStore({
  dispatch() {
    return undefined;
  },
});