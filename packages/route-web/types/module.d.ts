import { CoreModuleHandlers, CoreModuleState, ControllerMiddleware, CommonModule } from '@medux/core';
import { LocationTransform } from './transform';
import type { RootParams, RouteState, HistoryAction } from './basic';
import type { PagenameMap, NativeLocationMap } from './transform';
export declare class ModuleWithRouteHandlers<S extends CoreModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
    Init(initState: S): S;
    RouteParams(payload: Partial<S>): S;
}
export declare const RouteActionTypes: {
    MRouteParams: string;
    RouteChange: string;
    TestRouteChange: string;
};
export declare function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): {
    type: string;
    payload: RouteState<P>[];
};
export declare function routeParamsAction(moduleName: string, params: any, action: HistoryAction): {
    type: string;
    payload: any[];
};
export declare function routeChangeAction<P extends RootParams>(routeState: RouteState<P>): {
    type: string;
    payload: RouteState<P>[];
};
export declare const routeMiddleware: ControllerMiddleware;
export declare type RouteModule = CommonModule & {
    locationTransform: LocationTransform<any>;
};
export declare function createRouteModule<P extends RootParams, G extends PagenameMap<P>>(defaultParams: P, pagenameMap: G, nativeLocationMap: NativeLocationMap, notfoundPagename?: string, paramsKey?: string): {
    default: {
        moduleName: "route";
        model: import("@medux/core").Model;
        initState: RouteState<P>;
        views: { [k in keyof G]: any; };
        actions: {
            initState: never;
            moduleName: never;
            store: never;
            actions: never;
        };
    };
    locationTransform: LocationTransform<P>;
};
