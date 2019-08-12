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
export interface CommentsRouteParams {
    itemId: string;
    articleType: 'videos' | 'photos';
    articleId: string;
    _detailKey: string;
    _listKey: string;
    listSearch: {
        isNewest: boolean;
        page: number;
        pageSize: number;
    };
}
