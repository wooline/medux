import { Middleware, ReducersMapObject, StoreEnhancer } from 'redux';
import { Action, ModuleStore } from './basic';
export interface StoreOptions {
    ssrInitStoreKey?: string;
    reducers?: ReducersMapObject;
    middlewares?: Middleware[];
    enhancers?: StoreEnhancer[];
    initData?: {
        [key: string]: any;
    };
}
export declare function getActionData(action: Action): any[];
export declare function buildStore(preloadedState?: {
    [key: string]: any;
}, storeReducers?: ReducersMapObject<any, any>, storeMiddlewares?: Middleware[], storeEnhancers?: StoreEnhancer[]): ModuleStore;
