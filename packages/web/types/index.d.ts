import { BrowserHistoryBuildOptions, History, MemoryHistoryBuildOptions } from 'history';
import { HistoryProxy, RouteData } from '@medux/core/types/export';
interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: RouteData;
}
export interface BrowserLocation {
    pathname: string;
    search: string;
    hash: string;
}
declare type RoutePayload = Pick<RouteData, 'params' | 'paths'>;
export declare type RouteToLocation = (routeData: RoutePayload) => BrowserLocation;
export declare type LocationToRoute = (location: BrowserLocation) => RouteData;
export interface TransformRoute {
    locationToRoute: LocationToRoute;
    routeToLocation: RouteToLocation;
}
export declare type BrowserHistoryOptions = BrowserHistoryBuildOptions & TransformRoute;
export declare type MemoryHistoryOptions = MemoryHistoryBuildOptions & TransformRoute;
export interface HistoryActions {
    push(data: RouteData | BrowserLocation | string): void;
    replace(data: RouteData | BrowserLocation | string): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
}
export declare function createHistory(options: BrowserHistoryOptions | MemoryHistoryOptions): {
    history: History<any>;
    historyProxy: HistoryProxy<Location>;
    historyActions: HistoryActions;
};
export {};
