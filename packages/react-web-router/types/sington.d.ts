import { LoadView } from '@medux/react';
import type { RootModuleFacade, RootModuleAPI, RootModuleActions } from '@medux/core';
import type { Store } from 'redux';
import type { RootState, HistoryActions } from '@medux/web';
export interface ServerRequest {
    url: string;
}
export interface ServerResponse {
    redirect(status: number, path: string): void;
}
export declare type FacadeExports<APP extends RootModuleFacade, RouteParams extends {
    [K in keyof APP]: any;
}, Request extends ServerRequest = ServerRequest, Response extends ServerResponse = ServerResponse> = {
    App: {
        store: Store;
        state: RootState<APP, RouteParams>;
        loadView: LoadView<APP>;
        history: HistoryActions<RouteParams>;
        getActions<N extends keyof APP>(...args: N[]): {
            [K in N]: APP[K]['actions'];
        };
        request: Request;
        response: Response;
    };
    Modules: RootModuleAPI<APP>;
    Actions: RootModuleActions<APP>;
};
export declare const appExports: {
    store: any;
    state: any;
    loadView: any;
    getActions: any;
    history: HistoryActions;
    request: ServerRequest;
    response: ServerResponse;
};
export declare function patchActions(typeName: string, json?: string): void;
export declare function exportApp(): FacadeExports<any, any, any, any>;
