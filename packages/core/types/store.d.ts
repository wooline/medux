import { Action, ModelStore, RouteData } from './basic';
import { Middleware, ReducersMapObject, StoreEnhancer } from 'redux';
import { ModuleGetter } from './module';
export declare function loadModel<MG extends ModuleGetter>(moduleName: Extract<keyof MG, string>, storeInstance?: ModelStore, options?: any): void | Promise<void>;
export declare function getActionData(action: Action): any[];
export interface HistoryProxy<L = any> {
    initialized: boolean;
    getLocation(): L;
    subscribe(listener: (location: L) => void): () => void;
    locationToRouteData(location: L): RouteData;
    equal(a: L, b: L): boolean;
    patch(location: L, routeData: RouteData): void;
    destroy(): void;
}
export declare function buildStore(history: HistoryProxy<any>, preloadedState?: {
    [key: string]: any;
}, storeReducers?: ReducersMapObject<any, any>, storeMiddlewares?: Middleware[], storeEnhancers?: StoreEnhancer[]): ModelStore;
