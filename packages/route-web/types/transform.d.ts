import { Location, NativeLocation, DeepPartial, RootParams, PartialLocation } from './basic';
export declare type LocationTransform<P extends RootParams> = {
    in: (nativeLocation: NativeLocation | PartialLocation<P>) => Location<P>;
    out: (meduxLocation: PartialLocation<P>) => NativeLocation;
};
export declare type PagenameMap<P extends RootParams> = {
    [pagename: string]: {
        argsToParams(pathArgs: Array<string | undefined>): DeepPartial<P>;
        paramsToArgs(params: DeepPartial<P>): Array<any>;
    };
};
export declare type NativeLocationMap = {
    in(nativeLocation: NativeLocation): NativeLocation;
    out(nativeLocation: NativeLocation): NativeLocation;
};
export declare function assignDefaultData(data: {
    [moduleName: string]: any;
}): {
    [moduleName: string]: any;
};
export declare function createLocationTransform<P extends RootParams>(defaultParams: P, pagenameMap: PagenameMap<P>, nativeLocationMap: NativeLocationMap, notfoundPagename?: string, base64?: boolean, serialization?: {
    parse(str: string): any;
    stringify(data: any): string;
}, paramsKey?: string): LocationTransform<P>;
