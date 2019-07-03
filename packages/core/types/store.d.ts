import { ModelStore } from './basic';
import { Middleware, ReducersMapObject, StoreEnhancer } from 'redux';
export declare function invalidview(): void;
export declare function viewWillMount(moduleName: string, viewName: string): void;
export declare function viewWillUnmount(moduleName: string, viewName: string): void;
export declare function buildStore(preloadedState?: {
    [key: string]: any;
}, storeReducers?: ReducersMapObject<any, any>, storeMiddlewares?: Middleware[], storeEnhancers?: StoreEnhancer[]): ModelStore;
