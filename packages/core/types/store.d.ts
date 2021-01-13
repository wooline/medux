import { Middleware, ReducersMapObject, StoreEnhancer } from 'redux';
import { Action, ModuleStore } from './basic';
export interface StoreOptions {
    reducers?: ReducersMapObject;
    middlewares?: Middleware[];
    enhancers?: StoreEnhancer[];
    initData?: {
        [key: string]: any;
    };
}
export declare function getActionData(action: Action): any[];
export declare function isProcessedError(error: any): boolean;
export declare function setProcessedError(error: any, meduxProcessed: boolean): {
    __meduxProcessed__: boolean;
    [key: string]: any;
};
export declare function buildStore(preloadedState?: {
    [key: string]: any;
}, storeReducers?: ReducersMapObject<any, any>, storeMiddlewares?: Middleware[], storeEnhancers?: StoreEnhancer[]): ModuleStore;
