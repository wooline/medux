import { Action, ModelStore, RouteData } from './basic';
import { Middleware, ReducersMapObject, StoreEnhancer } from 'redux';
export declare function getActionData<T>(action: Action): T;
export interface HistoryProxy<L = any> {
    initialized: boolean;
    getLocation(): L;
    subscribe(listener: (location: L) => void): void;
    locationToRouteData(location: L): RouteData;
    equal(a: L, b: L): boolean;
    patch(location: L, routeData: RouteData): void;
}
export declare function buildStore(history: HistoryProxy<any>, preloadedState?: {
    [key: string]: any;
}, storeReducers?: ReducersMapObject<any, any>, storeMiddlewares?: Middleware[], storeEnhancers?: StoreEnhancer[]): ModelStore;
