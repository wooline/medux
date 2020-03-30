import { HistoryProxy, RouteData } from '@medux/core';
import { History } from 'history';
export { createBrowserHistory, createMemoryHistory, createHashHistory } from 'history';
interface BrowserLocation {
    pathname: string;
    search: string;
    hash: string;
    state: RouteData;
}
export interface MeduxLocation {
    pathname: string;
    search: string;
    hash: string;
}
export declare type RouteToLocation = (routeData: RouteData) => MeduxLocation;
export declare type LocationToRoute = (location: MeduxLocation) => RouteData;
export interface TransformRoute {
    locationToRoute: LocationToRoute;
    routeToLocation: RouteToLocation;
}
export interface HistoryActions<P = RouteData> {
    push(data: P | MeduxLocation | string): void;
    replace(data: P | MeduxLocation | string): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
}
export declare function createHistory(history: History, transformRoute: TransformRoute): {
    historyProxy: HistoryProxy<BrowserLocation>;
    historyActions: HistoryActions<RouteData>;
};
