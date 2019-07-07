import { ModelStore, RouteData } from './basic';
import { Middleware, ReducersMapObject, StoreEnhancer } from 'redux';
export declare function invalidview(): void;
export declare function viewWillMount(moduleName: string, viewName: string, vid: string): void;
export declare function viewWillUnmount(moduleName: string, viewName: string, vid: string): void;
export interface HistoryProxy<L = any> {
    getLocation(): L;
    subscribe(listener: (location: L) => void): void;
    locationToRouteData(location: L): RouteData;
    isTimeTravel(storeLocation: L): boolean;
    patch(location: L, routeData: RouteData): void;
}
export declare function buildStore(history: HistoryProxy<any>, preloadedState?: {
    [key: string]: any;
}, storeReducers?: ReducersMapObject<any, any>, storeMiddlewares?: Middleware[], storeEnhancers?: StoreEnhancer[]): ModelStore;
