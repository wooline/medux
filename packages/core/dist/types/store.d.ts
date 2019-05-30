import { Middleware, ReducersMapObject, StoreEnhancer } from 'redux';
import { ModelStore } from './basic';
export declare function viewWillMount(moduleName: string, viewName: string): void;
export declare function viewWillUnmount(moduleName: string, viewName: string): void;
export declare function buildStore(preloadedState?: {
    [key: string]: any;
}, storeReducers?: ReducersMapObject<any, any>, storeMiddlewares?: Middleware[], storeEnhancers?: StoreEnhancer[]): ModelStore;
//# sourceMappingURL=store.d.ts.map