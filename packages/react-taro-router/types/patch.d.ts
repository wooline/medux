import { SingleDispatcher } from '@medux/core';
import type { RouteENV } from '@medux/route-mp';
declare type RouteChangeEventData = {
    pathname: string;
    searchData?: {
        [key: string]: string;
    };
    action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
};
export declare const eventBus: SingleDispatcher<RouteChangeEventData>;
export declare const tabPages: {
    [path: string]: boolean;
};
export declare const routeENV: RouteENV;
export {};
