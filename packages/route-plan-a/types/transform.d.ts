import type { Params, Location, NativeLocation } from './basic';
export declare type LocationTransform<P extends Params = Params> = {
    in: (nativeLocation: NativeLocation) => Location<P>;
    out: (meduxLocation: Location<P>) => NativeLocation;
};
export declare type LocationMap<P extends Params = Params> = {
    in: (meduxLocation: Location) => Location<P>;
    out: (nativeLocation: Location<P>) => Location;
};
export declare function createLocationTransform<P extends Params>(defaultData?: {
    [moduleName: string]: any;
}, locationMap?: LocationMap<P>, key?: string): LocationTransform<P>;
