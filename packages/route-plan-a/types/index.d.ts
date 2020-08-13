import { HistoryProxy, RouteData, RouteParams } from '@medux/core';
import assignDeep from './deep-extend';
export { checkUrl, checkLocation, safeurlToLocation, safelocationToUrl } from './utils';
export interface MeduxLocation {
    pathname: string;
    search: string;
    hash: string;
    action?: string;
}
export interface LocationPayload {
    pathname: string;
    search?: string;
    hash?: string;
    action?: string;
}
export interface RoutePayload<P extends RouteParams> {
    paths: string[] | string;
    params?: DeepPartial<P>;
    action?: string;
    extend?: RouteData<P>;
}
export interface TransformRoute<P extends RouteParams = any> {
    locationToRoute: (location: MeduxLocation) => RouteData<P>;
    routeToLocation: (paths: string[] | string, params?: P, action?: string) => MeduxLocation;
    payloadToLocation: (payload: LocationPayload | RoutePayload<P>) => MeduxLocation;
    urlToLocation: (url: string) => MeduxLocation;
}
export declare const deepAssign: typeof assignDeep;
export declare function setRouteConfig(conf: {
    escape?: boolean;
    dateParse?: boolean;
    splitKey?: string;
    defaultRouteParams?: {
        [moduleName: string]: any;
    };
}): void;
export interface RouteConfig {
    [path: string]: string | [string, RouteConfig];
}
declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export declare function assignRouteData(paths: string[], params: {
    [moduleName: string]: any;
}, action?: string): RouteData;
export declare function buildTransformRoute<P extends RouteParams>(routeConfig: RouteConfig, getCurPathname: () => string): TransformRoute<P>;
export declare type LocationListener = (location: MeduxLocation) => void;
export declare type LocationBlocker = (location: MeduxLocation, curLocation: MeduxLocation) => void | Promise<void>;
export declare abstract class BaseHistoryActions implements HistoryProxy<MeduxLocation> {
    initialized: boolean;
    protected _transformRoute: TransformRoute<any>;
    private _uid;
    private _listenList;
    private _blockerList;
    protected _location: MeduxLocation;
    protected _startupLocation: MeduxLocation;
    constructor(location: MeduxLocation, initialized: boolean, _transformRoute: TransformRoute<any>);
    equal(a: MeduxLocation, b: MeduxLocation): boolean;
    getLocation(): MeduxLocation;
    getRouteData(): RouteData<any>;
    subscribe(listener: LocationListener): () => void;
    block(listener: LocationBlocker): () => void;
    locationToRouteData(location: MeduxLocation): RouteData<any>;
    dispatch(location: MeduxLocation): Promise<void>;
    abstract patch(location: MeduxLocation, routeData: RouteData<any>): void;
    abstract destroy(): void;
    abstract passive(location: MeduxLocation): void;
}
