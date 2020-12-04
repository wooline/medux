import type { Params, Location, NativeLocation, WebNativeLocation } from './basic';
export declare type LocationTransform<P extends Params, NL extends NativeLocation> = {
    in: (nativeLocation: NL) => Location<P>;
    out: (meduxLocation: Location<P>) => NL;
};
export declare type LocationMap<P extends Params> = {
    in: (location: Location<any>) => Location<P>;
    out: (location: Location<P>) => Location<any>;
};
export declare function createWebLocationTransform<P extends Params>(defaultData?: P, locationMap?: LocationMap<P>, serialization?: {
    parse(str: string): any;
    stringify(data: any): string;
}, key?: string): LocationTransform<P, WebNativeLocation>;
