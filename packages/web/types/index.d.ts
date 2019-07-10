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
declare type Params = RouteData['params'];
export interface RoutePayload<P extends Params = Params> {
    params: P;
    paths: string[];
}
export declare type RouteToLocation = (routeData: RoutePayload) => BrowserLocation;
export declare type LocationToRoute = (location: BrowserLocation) => RouteData;
export interface TransformRoute {
    locationToRoute: LocationToRoute;
    routeToLocation: RouteToLocation;
}
export declare type BrowserHistoryOptions = BrowserHistoryBuildOptions & TransformRoute;
export declare type MemoryHistoryOptions = MemoryHistoryBuildOptions & TransformRoute;
export interface HistoryActions<P extends Params = Params> {
    push(data: RoutePayload<P> | BrowserLocation | string): void;
    replace(data: RoutePayload<P> | BrowserLocation | string): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
}
export declare function createHistory(options: BrowserHistoryOptions | MemoryHistoryOptions): {
    history: History<any>;
    historyProxy: HistoryProxy<Location>;
    historyActions: HistoryActions<{
        [moduleName: string]: {
            [key: string]: any;
        } | undefined;
    }>;
};
export {};
