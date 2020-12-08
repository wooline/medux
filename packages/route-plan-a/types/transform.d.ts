import { PathnameRules } from './matchPath';
import type { RootParams, Location, NativeLocation, WebNativeLocation } from './basic';
export declare type LocationTransform<P extends RootParams, NL extends NativeLocation> = {
    in: (nativeLocation: NL) => Location<P>;
    out: (meduxLocation: Location<P>) => NL;
};
export declare type LocationMap<P extends RootParams> = {
    in: (location: Location<any>) => Location<P>;
    out: (location: Location<P>) => Location<any>;
};
export declare function isLocationMap<P extends RootParams>(data: LocationMap<P> | PathnameRules<P>): data is LocationMap<P>;
export declare function createWebLocationTransform<P extends RootParams>(defaultData: P, pathnameRules?: PathnameRules<P>, base64?: boolean, serialization?: {
    parse(str: string): any;
    stringify(data: any): string;
}, key?: string): LocationTransform<P, WebNativeLocation>;
