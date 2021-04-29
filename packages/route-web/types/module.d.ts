import { CoreModuleHandlers, CoreModuleState, ControllerMiddleware, IStore, IModuleHandlers } from '@medux/core';
import type { RouteState, HistoryAction } from './basic';
export declare class RouteModuleHandlers<S extends CoreModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
    Init(initState: S): S;
    RouteParams(payload: Partial<S>): S;
}
export declare const RouteActionTypes: {
    MRouteParams: string;
    RouteChange: string;
    TestRouteChange: string;
};
export declare function testRouteChangeAction<P extends {
    [key: string]: any;
}>(routeState: RouteState<P>): {
    type: string;
    payload: RouteState<P>[];
};
export declare function routeParamsAction(moduleName: string, params: any, action: HistoryAction): {
    type: string;
    payload: any[];
};
export declare function routeChangeAction<P extends {
    [key: string]: any;
}>(routeState: RouteState<P>): {
    type: string;
    payload: RouteState<P>[];
};
export declare const routeMiddleware: ControllerMiddleware;
export declare class RouteHandlers<P extends {
    [key: string]: any;
} = {}> implements IModuleHandlers {
    initState: RouteState<P>;
    moduleName: string;
    store: IStore<any>;
    actions: {};
    protected get state(): RouteState<P>;
    RouteChange(routeState: RouteState<P>): any;
}
