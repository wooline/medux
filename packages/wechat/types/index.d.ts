import './env';
import { InitAppOptions } from '@medux/mini-program';
export { connectComponent } from './connectComponent';
export { connectPage } from './connectPage';
export { ActionTypes, delayPromise, client, env, isDevelopmentEnv, LoadingState, exportActions, BaseModelHandlers, modelHotReplacement, effect, errorAction, reducer, viewHotReplacement, setLoading, setConfig, logger, setLoadingDepthTime, } from '@medux/core';
export type { Actions, RouteData, RouteViews, BaseModelState } from '@medux/core';
export type { RouteConfig, LocationMap, RootState, BrowserRouter } from '@medux/mini-program';
export { exportModule } from '@medux/mini-program';
export interface DispatchProp {
    dispatch?: (action: {
        type: string;
    }) => any;
}
export declare function buildApp(options: Omit<InitAppOptions, 'startupUrl'>): {
    store: import("redux").Store<any, import("redux").AnyAction>;
    historyActions: import("@medux/mini-program/types/history").HistoryActions<{}>;
    toBrowserUrl: import("@medux/mini-program/types/history").ToBrowserUrl<{}>;
    transformRoute: import("@medux/route-plan-a/types").TransformRoute;
};
