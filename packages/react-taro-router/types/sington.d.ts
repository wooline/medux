import type { Store } from 'redux';
import type { RootModuleFacade, RootModuleAPI, RootModuleActions } from '@medux/core';
import type { RootState } from '@medux/route-web';
import type { Router } from '@medux/route-mp';
import { LoadView } from './loadView';
export declare type FacadeExports<APP extends RootModuleFacade, RouteParams extends {
    [K in keyof APP]: any;
}, Pagename extends string> = {
    App: {
        store: Store;
        state: RootState<APP, RouteParams>;
        loadView: LoadView<APP>;
        router: Router<RouteParams, Pagename>;
        getActions<N extends keyof APP>(...args: N[]): {
            [K in N]: APP[K]['actions'];
        };
    };
    Modules: RootModuleAPI<APP>;
    Actions: RootModuleActions<APP>;
    Pagenames: {
        [K in Pagename]: K;
    };
};
export declare const appExports: {
    store: any;
    state: any;
    loadView: any;
    getActions: any;
    router: Router<any, string>;
};
export declare function patchActions(typeName: string, json?: string): void;
export declare function exportApp(): FacadeExports<any, any, any>;
