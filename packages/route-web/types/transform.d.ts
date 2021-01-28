import type { Location, NativeLocation, DeepPartial, RootParams } from './basic';
export declare type LocationTransform<P extends RootParams> = {
    in: (nativeLocation: NativeLocation) => Location<P>;
    out: (meduxLocation: Location<P>) => NativeLocation;
};
export declare type PathnameTransform<DP extends {
    [key: string]: any;
}> = {
    in(pathname: string): {
        pagename: string;
        pathParams: DP;
    };
    out(pagename: string, params: DP): {
        pathname: string;
        pathParams: DP;
    };
};
export declare type PagenameMap<DP extends {
    [key: string]: any;
}> = {
    [pagename: string]: {
        in(pathParams: Array<string | undefined>): DP;
        out(params: DP): Array<any>;
    };
};
export declare function createPathnameTransform<DP extends {
    [key: string]: any;
}>(pathnameIn: (pathname: string) => string, pagenameMap: PagenameMap<DP>, pathnameOut?: (pathname: string) => string): PathnameTransform<DP>;
export declare function createLocationTransform<P extends RootParams>(pathnameTransform: PathnameTransform<DeepPartial<P>>, defaultData: P, base64?: boolean, serialization?: {
    parse(str: string): any;
    stringify(data: any): string;
}, paramsKey?: string): LocationTransform<P>;
