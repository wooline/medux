import { LocationPayload, MeduxLocation, RouteConfig, RoutePayload, TransformRoute } from '@medux/route-plan-a';
import { History } from 'history';
import { HistoryProxy, RouteData, RouteParams } from '@medux/core';
export declare enum Action {
    Push = "PUSH",
    Pop = "POP",
    Replace = "REPLACE"
}
export declare type LocationToLocation = (location: MeduxLocation) => MeduxLocation;
export declare type LocationMap = {
    in: LocationToLocation;
    out: LocationToLocation;
};
export interface HistoryActions<P extends RouteParams = any> extends HistoryProxy<MeduxLocation> {
    getHistory(): History;
    getRouteData(): RouteData;
    push(data: RoutePayload<P> | LocationPayload | string): Promise<void>;
    replace(data: RoutePayload<P> | LocationPayload | string): Promise<void>;
    toUrl(data: RoutePayload<P> | LocationPayload | string): string;
    go(n: number): void;
    back(): void;
    forward(): void;
    dispatch(location: MeduxLocation): Promise<void>;
}
export declare function createRouter(createHistory: 'Browser' | 'Hash' | 'Memory' | string, routeConfig: RouteConfig, locationMap?: LocationMap): {
    transformRoute: TransformRoute<any>;
    historyActions: HistoryActions<any>;
};
