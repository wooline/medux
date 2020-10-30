import { Middleware, ReducersMapObject, StoreEnhancer } from 'redux';
import { Action, ModelStore, RouteState } from './basic';
import { ModuleGetter } from './module';
export declare function loadModel<MG extends ModuleGetter>(moduleName: Extract<keyof MG, string>, storeInstance?: ModelStore, options?: any): void | Promise<void>;
export declare function getActionData(action: Action): any[];
export interface HistoryProxy {
    getRouteState(): RouteState | undefined;
    subscribe(listener: (routeState: RouteState) => void): () => void;
    destroy(): void;
}
export declare function buildStore(history: HistoryProxy, preloadedState?: {
    [key: string]: any;
}, storeReducers?: ReducersMapObject<any, any>, storeMiddlewares?: Middleware[], storeEnhancers?: StoreEnhancer[]): ModelStore;
