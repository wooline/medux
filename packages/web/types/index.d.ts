import { LocationPayload, MeduxLocation, RouteConfig, RoutePayload, TransformRoute } from '@medux/route-plan-a';
import { HistoryProxy, RouteData, RouteParams } from '@medux/core';
declare type UnregisterCallback = () => void;
export declare type LocationToLocation = (location: MeduxLocation) => MeduxLocation;
export declare type LocationMap = {
    in: LocationToLocation;
    out: LocationToLocation;
};
export interface History {
    location: MeduxLocation;
    action: string;
    push(location: MeduxLocation): void;
    replace(location: MeduxLocation): void;
    go(n: number): void;
    back(): void;
    forward(): void;
    listen(listener: (location: MeduxLocation, action: string) => void): UnregisterCallback;
}
export interface HistoryActions<P extends RouteParams = any> extends HistoryProxy<MeduxLocation> {
    getRouteData(): RouteData;
    push(data: RoutePayload<P> | LocationPayload | string): void;
    replace(data: RoutePayload<P> | LocationPayload | string): void;
    toUrl(data: RoutePayload<P> | LocationPayload | string): string;
    go(n: number): void;
    back(): void;
    forward(): void;
}
export declare function createRouter(history: History, routeConfig: RouteConfig, locationMap?: LocationMap): {
    transformRoute: TransformRoute<any>;
    historyActions: HistoryActions<any>;
};
export {};
