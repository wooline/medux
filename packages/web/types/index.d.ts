import { BrowserHistoryBuildOptions, History, MemoryHistoryBuildOptions } from 'history';
import { HistoryProxy, RouteData } from '@medux/core/types/export';
interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: RouteData;
    key?: string;
}
export interface BrowserLocation {
    pathname: string;
    search: string;
    hash: string;
    key?: string;
}
export interface BrowserHistoryOptions extends BrowserHistoryBuildOptions {
    locationToRoute: (location: BrowserLocation) => RouteData;
    routeToLocation: (data: RouteData) => BrowserLocation;
}
export interface MemoryHistoryOptions extends MemoryHistoryBuildOptions {
    locationToRoute: (location: BrowserLocation) => RouteData;
    routeToLocation: (data: RouteData) => BrowserLocation;
}
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
