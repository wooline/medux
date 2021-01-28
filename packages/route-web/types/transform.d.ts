import { Location, NativeLocation, DeepPartial, RootParams } from './basic';
export declare type LocationTransform<P extends RootParams> = {
    in: (nativeLocation: NativeLocation) => Location<P>;
    out: (meduxLocation: Location<P>) => NativeLocation;
};
export declare type PathnameTransform<P extends RootParams> = {
    in(pathname: string): {
        pagename: string;
        pathParams: DeepPartial<P>;
    };
    out(pagename: string, params: DeepPartial<P>): {
        pathname: string;
        pathParams: DeepPartial<P>;
    };
};
export declare type PagenameMap<P extends RootParams> = {
    [pagename: string]: {
        in(pathParams: Array<string | undefined>): DeepPartial<P>;
        out(params: DeepPartial<P>): Array<any>;
    };
};
export declare function createPathnameTransform<P extends RootParams>(pathnameIn: (pathname: string) => string, pagenameMap: PagenameMap<P>, pathnameOut?: (pathname: string) => string): PathnameTransform<P>;
export declare function createLocationTransform<P extends RootParams>(pathnameTransform: PathnameTransform<P>, defaultData: P, base64?: boolean, serialization?: {
    parse(str: string): any;
    stringify(data: any): string;
}, paramsKey?: string): LocationTransform<P>;
