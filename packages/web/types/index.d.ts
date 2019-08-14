import { HistoryProxy, RouteData } from '@medux/core/types/export';
import { History } from 'history';
export { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';
interface BrowserLocation {
    pathname: string;
    search: string;
    hash: string;
    state: RouteData;
}
export interface Location {
    pathname: string;
    search: string;
    hash: string;
}
export declare type RouteToLocation = (routeData: RouteData) => Location;
export declare type LocationToRoute = (location: Location) => RouteData;
export interface TransformRoute {
    locationToRoute: LocationToRoute;
    routeToLocation: RouteToLocation;
}
export interface HistoryActions<P = RouteData> {
    push(data: P | Location | string): void;
    replace(data: P | Location | string): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
}
export declare function createHistory(history: History, transformRoute: TransformRoute): {
    historyProxy: HistoryProxy<BrowserLocation>;
    historyActions: HistoryActions<RouteData>;
};
